const MAX_NODE_NUMBER = 100;

export class TreeNode {
    constructor(key, left, right) {
        this.key = key;
        this.left = left;
        this.right = right;

        this.position = undefined;
        this.width = undefined;
    }
}

export function findNode(root, nodeKey) {
    if (root === null) {
        return null;
    }
    if (nodeKey < root.key) {
        return findNode(root.left, nodeKey);
    } else if (nodeKey > root.key) {
        return findNode(root.right, nodeKey);
    } else {
        return root;
    }
}

export function insertNode(root, newNodeKey) {
    if (root === null) {
        return new TreeNode(newNodeKey, null, null);
    }
    if (newNodeKey < root.key) {
        root.left = insertNode(root.left, newNodeKey);
    } else if (newNodeKey > root.key) {
        root.right = insertNode(root.right, newNodeKey);
    } else {
        console.error("You were trying to insert a number that was already in the tree.");
    }
    return root;
}

export function generateTree(numberOfNodes) {
    let root = null;
    for (let i = 0; i < numberOfNodes; i++) {
        root = insertNode(root, getRandomMissingKey(root));
    }
    return root;
}

export function getTreeHeight(treeRoot) {
    if (treeRoot === null) {
        return -1;
    }
    return Math.max(getTreeHeight(treeRoot.left), getTreeHeight(treeRoot.right)) + 1;
}

export function getNodesAsList(treeNode) {
    if (treeNode === null) {
        return [];
    }
    return [...getNodesAsList(treeNode.left), treeNode, ...getNodesAsList(treeNode.right)];
}

export function getNodeLevels(treeNode, level) {
    if (treeNode === null) {
        return [];
    }
    return [...getNodeLevels(treeNode.left, level + 1), [treeNode, level], ...getNodeLevels(treeNode.right, level + 1)];
}

const MINIMUM_LEVEL = 2;

export function getRandomNode(treeNode) {
    const nodeLevels = getNodeLevels(treeNode, 0);
    const possibleNodes = nodeLevels.filter(pair => pair[1] >= MINIMUM_LEVEL).map(pair => pair[0]);
    const randIndex = Math.round(Math.random() * (possibleNodes.length - 1));
    return possibleNodes[randIndex];
}

export function getRandomMissingKey(treeRoot) {
    let randomNumber = Math.ceil(Math.random() * MAX_NODE_NUMBER);
    while (findNode(treeRoot, randomNumber)) {
        randomNumber = Math.ceil(Math.random() * MAX_NODE_NUMBER);
    }
    return randomNumber;
}

export function numberOfTriesToFindKey(treeNode, key) {
    if (treeNode === null) {
        return 0;
    }
    if (key === treeNode.key) {
        return 1;
    }
    if (key < treeNode.key) {
        return 1 + numberOfTriesToFindKey(treeNode.left, key);
    }
    return 1 + numberOfTriesToFindKey(treeNode.right, key);
}
