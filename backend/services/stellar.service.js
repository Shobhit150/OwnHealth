import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
} from "stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET);

export async function storeScore(name, score) {
  const account = await server.loadAccount(keypair.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.manageData({
        name: `user_${name}`,
        value: `score_${score}`,
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(keypair);

  return await server.submitTransaction(tx);
}