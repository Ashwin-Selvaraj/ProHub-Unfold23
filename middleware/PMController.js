const { ethers, JsonRpcProvider } = require("ethers"); 
const config = require("../config/config");
const { Web3 } = require("web3");
const keccak256 = require("keccak256");
const logger = require("../middleware/logger");

const { infuraURL, contractABI, contractAddress, privateKey } = config;
const web3 = new Web3(infuraURL);
const provider = new JsonRpcProvider(infuraURL);
const wallet = new ethers.Wallet(privateKey, provider);
const contractWithSigner = new ethers.Contract(
  contractAddress,
  contractABI,
  wallet
);

exports.addUser = async function (req, res) {
  try {
    logger.info("Add user function is called");
    const { address, name, role } = req.body;
    const tx = await contractWithSigner.addUser(address, name, role);
    await tx.wait();
    logger.debug(
      `User with name ${name} is successfully added to the smart contract`
    );
    res
      .status(200)
      .json({
        message: `Added user with address:${address} to blockchain.`,
        hash: tx.hash,
      });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.addProject = async function (req, res) {
  try {
    logger.info("Add Project function is called");
    const { id, name } = req.body;
    const bytes32Id = ethers.id(id);
    const tx = await contractWithSigner.addProject(bytes32Id, name);
    await tx.wait();
    logger.debug(
      `Project with name ${name} is successfully added to the smart contract`
    );
    res.status(200).json({
      message: `Added project with id:${bytes32Id} to blockchain.`,
      hash: tx.hash,
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.addTask = async function (req, res) {
  try {
    logger.info("Add Task function is called");

    const { projectId, name, status } = req.body;
    const bytes32ProjectId = ethers.id(projectId);
    const tx = await contractWithSigner.addTask(bytes32ProjectId, name, status);
    await tx.wait();
    logger.debug(
      `Task with name ${name} belonging to Project with id ${projectId} is successfully added to the smart contract`
    );
    res
      .status(200)
      .json({ message: "Added task to blockchain.", hash: tx.hash });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.addMilestone = async function (req, res) {
  try {
    logger.info("Add Task function is called");

    const { projectId, name, status } = req.body;
    const bytes32ProjectId = ethers.id(projectId);
    const tx = await contractWithSigner.addMilestone(
      bytes32ProjectId,
      name,
      status
    );
    await tx.wait();
    logger.debug(
      `Milestone with name ${name} belonging to Project with id ${projectId} is successfully added to the smart contract`
    );

    res
      .status(200)
      .json({ message: "Added milestone to blockchain.", hash: tx.hash });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getUser = async function (req, res) {
  try {
    logger.info("get User function is called");
    const userAddress = req.params.userAddress;
    const userData = await contractWithSigner.users(userAddress);
    res.status(200).json({
      message: `Retrieved user with address:${userAddress} from blockchain.`,
      userData,
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getProject = async function (req, res) {
  try {
    logger.info("get Project function is called");
    const id = req.params.id;
    const project = await contractWithSigner.projects(ethers.id(id));
    res.status(200).json({ project });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getTaskCount = async function (req, res) {
  try {
    logger.info("get TaskCount function is called");
    const id = req.params.id;
    const taskCount = await contractWithSigner.getTaskCount(ethers.id(id));
    res.status(200).json({ taskCount });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getTaskByIndex = async function (req, res) {
  try {
    logger.info("get Task of particular index  is called");
    const id = req.params.id;
    const index = req.params.index;
    const task = await contractWithSigner.getTaskByIndex(ethers.id(id), index);
    res.status(200).json({ task });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getLastMilestone = async function (req, res) {
  try {
    logger.info("get Last milestone function  is called");
    const id = req.params.id;
    const milestone = await contractWithSigner.getLastMilestone(ethers.id(id));
    res.status(200).json({ milestone });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

const generateMerkleRoot = async function (tasks) {
  try {
    logger.info("Generate Merkle root for the tasks  is called");
    // const tasks = req.body.tasks;
    const leaves = tasks.map((t) => keccak256(JSON.stringify(t)));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();
    return root;
  } catch (error) {
    logger.error(error.message);
  }
};

exports.setMerkleRootToProject = async function (req, res) {
  try {
    logger.info("Set Merkle root for the Project  is called");
    const id = req.body.id;
    const tasks = req.body.tasks;
    const merkleRoot = await generateMerkleRoot(tasks); // Assuming generateMerkleRoot is defined elsewhere
    const tx = await contractWithSigner.setMerkleRoot(
      ethers.id(id),
      merkleRoot
    );
    await tx.wait();
    res
      .status(200)
      .json({
        message: "Merkle root has been added to the Project",
        hash: tx.hash,
      });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.verifyTask = async function (req, res) {
  try {
    logger.info("Verify task function is called");
    const id = req.body.id;
    const task = req.body.task;
    const tasks = req.body.tasks;
    const tree = await getTree(tasks);
   // logger.debug("tree",tree) // Assuming getTree is defined elsewhere
    const leaf = keccak256(JSON.stringify(task));
    //logger.debug("leaf",leaf)
    const leafHex = "0x" + leaf.toString("hex");
   // logger.debug("leafHex",leafHex)
    const proof = tree.getHexProof(leaf);
    logger.debug("proof",proof)
    const isValid = await contractWithSigner.verifyTask(
      ethers.id(id),
      proof,
      leafHex
    );
    res.status(200).json({ isValid });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

async function getTree(tasks) {
  const leaves = tasks.map((t) => keccak256(JSON.stringify(t)));
  console.log("leaves", leaves);
  var tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  console.log("tree", tree.toString());
  return tree;
}
