// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const process = require("process");
const bs58 = require("bs58");

const argv = (key) => {
  // Return true if the key exists and a value is defined
  if ( process.argv.includes( `--${ key }` ) ) return true;

  const value = process.argv.find( (element) =>
    element.startsWith( `--${ key }=` ) );

  // Return null if the key does not exist and a value is not defined
  if ( !value ) return null;

  return value.replace( `--${ key }=`, "" );
};

if (argv("createWallet")) {
  const newPair = Keypair.generate();
  console.log(`Address: ${newPair.publicKey}`);
  console.log(`Private Key: ${bs58.encode(newPair.secretKey)}`);
  return;
}

if (!argv("address")) {
  console.error("Required '--address' parameter not found.");
  return;
}

// Get the wallet balance from a given private key
const getWalletBalance = async () => {
  try {
    // Connect to the Devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Make a wallet (keypair) from privateKey and get its balance
    const walletBalance = await connection.getBalance(
        new PublicKey(argv("address")),
    );
    const balance = parseInt(walletBalance) / LAMPORTS_PER_SOL;
    console.log(`Wallet balance: ${balance} SOL`);
  } catch (err) {
    console.log(err);
  }
};

const airDropSol = async () => {
  try {
    // Connect to the Devnet and make a wallet from privateKey
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Request airdrop of 2 SOL to the wallet
    console.log("Airdropping some SOL to my wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(argv("address")),
        2 * LAMPORTS_PER_SOL,
    );
    const blockInfo = await connection.getLatestBlockhash("confirmed");
    await connection.confirmTransaction({
      signature: fromAirDropSignature,
      lastValidBlockHeight: blockInfo.lastValidBlockHeight,
    });
  } catch (err) {
    console.log(err);
  }
};

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
  await getWalletBalance();
  await airDropSol();
  await getWalletBalance();
};

mainFunction();
