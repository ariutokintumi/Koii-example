const Web3 = require('web3');

// Replace 'YOUR_BLOCKNATIVE_PROVIDER_URL' with your actual Blocknative URL provided after registration
const web3 = new Web3("wss://api.blocknative.com/v0"); 

class Submission {
  /**
   * Executes your task, optionally storing the result.
   * @param {number} round - The current round number
   * @returns {void}
   */
  async task(round) {
    console.log('Started Task', new Date(), process.env.TEST_KEYWORD);
    try {
      console.log('ROUND', round);
      const value = 'Hello, World!';
      // Store the result in NeDB (optional)
      if (value) {
        await namespaceWrapper.storeSet('value', value);
      }
      // Optional, return your task
      return value;
    } catch (err) {
      console.log('ERROR IN EXECUTING TASK', err);
      return 'ERROR IN EXECUTING TASK' + err;
    }
  }

  /**
   * Submits a task for a given round
   * @param {number} round - The current round number
   * @returns {Promise<any>} The submission value that you will use in audit. Ex. cid of the IPFS file
   */
  async submitTask(round) {
    console.log('SUBMIT TASK CALLED ROUND NUMBER', round);
    try {
      console.log('SUBMIT TASK SLOT', await namespaceWrapper.getSlot());
      const submission = await this.fetchSubmission(round);
      console.log('SUBMISSION', submission);
      await namespaceWrapper.checkSubmissionAndUpdateRound(submission, round);
      console.log('SUBMISSION CHECKED AND ROUND UPDATED');
      return submission;
    } catch (error) {
      console.log('ERROR IN SUBMISSION', error);
    }
  }

  /**
   * Fetches the submission value
   * @param {number} round - The current round number
   * @returns {Promise<string>} The submission value that you will use in audit. It can be the real value, cid, etc.
   */
  async fetchSubmission(round) {
    console.log('Started Submission', new Date(), process.env.TEST_KEYWORD);
    console.log('FETCH SUBMISSION');
    // Fetch the value from NeDB
    const value = await namespaceWrapper.storeGet('value'); // retrieves the value
    // Return cid/value, etc.
    return value;
  }

  /** 
   * This needs debug
  const options = {
    dappId: process.env.BLOCKNATIVE_API_KEY,
    networkId: 1,
    system: 'ethereum', // optional, defaults to ethereum
    transactionHandlers: [event => console.log(event.transaction)],
    ws: WebSocket, // only neccessary in server environments 
    name: 'fisher1', // optional, use when running multiple instances
    onerror: (error) => {console.log(error)} //optional, use to catch errors
  }
  */

  /**
   * Validates the Ethereum transaction signature.
   * @param {Object} txData - The transaction data.
   * @returns {Promise<string>} Returns the signer address if valid, otherwise throws an error.
   */
  async validateTransactionSignature(txData) {
    const tx = {
      nonce: web3.utils.toHex(txData.nonce),
      gasPrice: web3.utils.toHex(txData.maxFeePerGas), // Using maxFeePerGas for EIP-1559 transaction types
      gasLimit: web3.utils.toHex(txData.gas),
      to: txData.to,
      value: web3.utils.toHex(txData.value),
      data: txData.input,
      chainId: parseInt(txData.chainId, 16), // Hex to decimal
      v: txData.v,
      r: txData.r,
      s: txData.s
    };

    try {
      const sender = await web3.eth.accounts.recoverTransaction(web3.eth.accounts.signTransaction(tx, ''));
      if (sender.toLowerCase() === txData.from.toLowerCase()) {
        return sender; // Signature is valid
      } else {
        throw new Error('Invalid signature: Signer does not match transaction from address');
      }
    } catch (error) {
      console.error('Failed to validate signature:', error);
      throw error; // Rethrow or handle error as needed
    }
  }
}

const submission = new Submission();
module.exports = { submission };
