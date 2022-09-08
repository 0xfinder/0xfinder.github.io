### [What is a blockchain?](https://www.coinbase.com/learn/crypto-basics/what-is-a-blockchain)

- list of transactions that anyone can view and verify (distributed & immutable ledger)
- removes the need for a centralized entity
- secured via blockchain networks
- advantages: global, private, open
- secured by large peer-to-peer network of computers running foss
- addresses made up of public key and private key
- sending money requires signing a transaction with priv key

blocks
- magic number - some sort of identifier
- blocksize - size limit of block
- block header - information about the block
- transaction counter - number of transactions
- transactions - list of transactions in a block

- block header
	- version - crypto version
	- previous block hash - hash of the previous block header (ensures nothing has been tampered with)
	- hash merkle root - hash of transactions in merkle tree of current block
	- time - timestamp to place block
	- bits - difficulty rating of the target hash aka how hard it is to solve the nonce
	- nonce - encryped number that miner has to solve to verify block

consensus mechanisms
- pow
- pos

hashing: mathematical function that converts an input of arbitrary length into an encrypted output of a fixed length // unique hash will always be the same size // hash functions are also one way (cant be reverse engineered) // deterministic(?) - the same hash will produce the same output for the same input
- solving hash starts w data in the block header
- miner focuses on nonce - appended to hashed contents of prev block, then hashed
- when new hash <= target hash then accepted as solution -> reward given -> block added
- bitcoin uses sha-256
- target hash starts with long string of zeroes
- miners generate a hash below target by altering the input by adding an integer (nonce)
- valid hash found -> broadcast to network

cryptographic hash functions
- collision-free - no two input hashes map to the same output hash
- hidden - difficult to guess input value for hash fx from output
- puzzle friendly - selection of input from wide distribution

prevention of double spending
- overcome by maintaining a common, universal ledger system
- recognized as invalid by confirmation process(?)
- if both transactions are pulled from the pool simultaneously, the transcation with highest no. of confirmations will be included in the blockchain and the other will be discarded
- some issues: assumption of invalid tx(?) some people wait for at least 6 confirmations before safely assuming the tx is valid
- 51% attack - reverse the blockchain and create a separate blockchai

51% attacks
