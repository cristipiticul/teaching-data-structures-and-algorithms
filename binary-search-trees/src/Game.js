import React from 'react';
import * as TreeUtils from './TreeUtils';
import { TreeRenderer, computeNodePositionAndDimensions } from './TreeRenderer';

const INITIAL_NUMBER_OF_NODES = 10;

export class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getStartingState(INITIAL_NUMBER_OF_NODES, true);
    }

    getStartingState(numberOfNodes, isFirstGame) {
        const treeRoot = TreeUtils.generateTree(INITIAL_NUMBER_OF_NODES);
        computeNodePositionAndDimensions(treeRoot, 0, 0);
        const randomKey = TreeUtils.getRandomNode(treeRoot).key;
        const keyToSearch = isFirstGame 
            ? randomKey
            : Math.random() > 0.5 
                ? randomKey
                : TreeUtils.getRandomMissingKey(treeRoot);
        const revealableNodes = new Set();
        revealableNodes.add(treeRoot);
        return {
            numberOfNodes: INITIAL_NUMBER_OF_NODES,
            gameOver: false,
            isFirstGame,
            treeRoot,
            keyToSearch,
            revealedNodes: new Set(),
            revealableNodes,
        };
    }
    
    restart = () => {
        this.setState(this.getStartingState(INITIAL_NUMBER_OF_NODES, false))
    };

    revealNode = (node) => {
        const { revealableNodes, revealedNodes, keyToSearch, treeRoot } = this.state;
        const newRevealableNodes = new Set(revealableNodes);
        const newRevealedNodes = new Set(revealedNodes);
        newRevealedNodes.add(node);
        newRevealableNodes.delete(node);
        if (node.left !== null) {
            newRevealableNodes.add(node.left);
        }
        if (node.right !== null) {
            newRevealableNodes.add(node.right);
        }
        this.setState({
            revealedNodes: newRevealedNodes,
            revealableNodes: newRevealableNodes
        });
        if (node.key === keyToSearch) {
            const minNumberOfTries = TreeUtils.numberOfTriesToFindKey(treeRoot, keyToSearch);
            if (minNumberOfTries === revealedNodes.size + 1) {
                alert("You found the node as soon as possible! Congrats!");
            } else {
                alert(`You found the node by uncovering ${revealedNodes.size + 1} elements (minimum was ${minNumberOfTries} elements). Congrats!`)
            }
            this.setState({
                gameOver: true
            });
        }
    }

    nodeDoesNotExistClick = () => {
        const { treeRoot, keyToSearch, revealedNodes } = this.state;
        if (TreeUtils.findNode(treeRoot, keyToSearch)) {
            alert("Keep trying. The node is there. I promise!");
        } else {
            const minNumberOfTries = TreeUtils.numberOfTriesToFindKey(treeRoot, keyToSearch);
            if (revealedNodes.size < minNumberOfTries) {
                alert(`You got lucky! The node doesn't exist, but you guessed that sooner than you should have (${revealedNodes.size} tires < minimum of ${minNumberOfTries} tries)`);
            } else if (revealedNodes.size === minNumberOfTries) {
                alert('Perfect! Congrats!')
            } else {
                alert(`Correct! You didn't have to uncover some of the nodes, but it's ok.`);
            }
            this.setState({
                gameOver: true
            });
        }
    }

    render() {
        const { treeRoot, revealableNodes, revealedNodes, keyToSearch, gameOver, isFirstGame } = this.state;
        return (
            <div className="game">
                <div className="search-node">
                    Find node with key <strong>{keyToSearch}</strong>!
                </div>
                <TreeRenderer
                    treeRoot={treeRoot}
                    revealableNodes={revealableNodes}
                    revealedNodes={revealedNodes}
                    onRevealNode={this.revealNode}
                    />
                <div className="score">
                    {/*
                        revealedNodes.size === 0  
                            ? "Nu ai descoperit niciun nod."
                            : revealedNodes.size === 1
                                ? <React.Fragment>Ai descoperit <strong>{revealedNodes.size}</strong> nod.</React.Fragment>
                                : <React.Fragment>Ai descoperit <strong>{revealedNodes.size}</strong> noduri.</React.Fragment>
                    */}
                </div>
                { !isFirstGame && <button type="button" className="button red" onClick={this.nodeDoesNotExistClick} disabled={gameOver}>The node doesn't exist!</button> }
                { gameOver && <button type="button" className="button green" onClick={this.restart}>Restart</button> }
            </div>
        )
    }
}