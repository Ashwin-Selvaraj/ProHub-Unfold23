const { error } = require('console');
const solc = require('solc');
const Fs = require('fs').promises;

async function main() {
    try {
        const sourceCode = await Fs.readFile('PMDAO.sol', 'utf8');
        const { abi, bytecode } = compile(sourceCode, 'PMDAO'); // Match the contract name here
        // FOR CREATING A JSON FILE
        const artifact = JSON.stringify({ abi, bytecode }, null, 2);
        await Fs.writeFile("PMDAO.json", artifact);
        console.log("Compilation successful. PMDAO.json created.");
    } catch (error) {
        console.log("ErroR: ", error);
    }
}

function compile(sourceCode, contractName) {
    const input = {
        language: "Solidity",
        sources: { "PMDAO.sol": { content: sourceCode } },
        settings: { outputSelection: { '*': { '*': ["abi", "evm.bytecode"] } } }
    }
    const output = solc.compile(JSON.stringify(input));
    const { contracts } = JSON.parse(output);

    if (!contracts || !contracts["PMDAO.sol"] || !contracts["PMDAO.sol"][contractName]) { // Match the contract name here
        throw new Error(`Contract ${contractName} not found in the compilation.`);
    }
    const artifact = contracts["PMDAO.sol"][contractName]; // Match the contract name here
    return {
        abi: artifact.abi,
        bytecode: artifact.evm.bytecode.object
    };
}

main().then(() => process.exit(0));
