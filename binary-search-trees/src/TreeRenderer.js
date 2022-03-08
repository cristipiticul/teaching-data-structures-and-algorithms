import React from 'react';
import * as TreeUtils from './TreeUtils';

const TOP_MARGIN = 20;
const LEFT_MARGIN = 20;
const NODE_SIZE = 50;

export function computeNodePositionAndDimensions(root, left, top) {
    if (root.left === null && root.right == null) {
        root.position = {
            left: left,
            top: top
        };
        root.width = NODE_SIZE;
    } else if (root.left === null) {
        computeNodePositionAndDimensions(root.right, left, top + NODE_SIZE + TOP_MARGIN);
        let leftPosition = root.right.position.left - LEFT_MARGIN - NODE_SIZE;
        root.width = root.right.width;
        if (leftPosition < left) {
            computeNodePositionAndDimensions(root.right, left + LEFT_MARGIN + NODE_SIZE, top + NODE_SIZE + TOP_MARGIN);
            leftPosition = left;
            root.width = root.right.width + NODE_SIZE + LEFT_MARGIN;
        }
        root.position = {
            left: leftPosition,
            top: top
        };
    } else if (root.right === null) {
        computeNodePositionAndDimensions(root.left, left, top + NODE_SIZE + TOP_MARGIN);
        root.position = {
            left: root.left.position.left + LEFT_MARGIN + NODE_SIZE,
            top: top
        }
        root.width = Math.max(root.left.width, root.position.left - left + LEFT_MARGIN + NODE_SIZE);
    } else {
        computeNodePositionAndDimensions(root.left, left, top + NODE_SIZE + TOP_MARGIN);
        computeNodePositionAndDimensions(root.right, left + root.left.width + 2 * LEFT_MARGIN, top + NODE_SIZE + TOP_MARGIN);
        root.width = root.left.width + 2 * LEFT_MARGIN + root.right.width;
        root.position = {
            left: (root.left.position.left + root.right.position.left) / 2,
            //left: left + root.left.width + LEFT_MARGIN,
            top: top
        }
    }
}


class TreeNodeComponent extends React.Component {

    revealNode = () => {
        const { node, isNodeRevealable, onRevealNode } = this.props;
        if (isNodeRevealable) {
            onRevealNode(node);
        }
    }

    render() {
        const { node, isNodeRevealable, isNodeRevealed } = this.props;
        return (
            <span
                key={node.key}
                className={`tree-node ${isNodeRevealed ? "revealed" : ""} ${isNodeRevealable ? "revealable" : ""}`}
                style={{ left: node.position.left, top: node.position.top }}
                onClick={this.revealNode}>
                <p>{node.key}</p>
            </span>
        );
    }
}

export class TreeRenderer extends React.Component {

    getElements() {
        const { treeRoot, revealableNodes, revealedNodes, onRevealNode } = this.props;
        const nodesList = TreeUtils.getNodesAsList(treeRoot);
        const nodeElems = nodesList.map(node =>
            <TreeNodeComponent
                key={node.key}
                node={node}
                isNodeRevealable={revealableNodes.has(node)}
                isNodeRevealed={revealedNodes.has(node)}
                onRevealNode={onRevealNode}
                />
        );
        const lineElems = [];
        for (let nodeNumber = 0; nodeNumber < nodesList.length; nodeNumber++) {
            const node = nodesList[nodeNumber];
            if (node.left !== null) {
                lineElems.push(this.createLine(node, node.left));
            }
            if (node.right !== null) {
                lineElems.push(this.createLine(node, node.right))
            }
        }
        return [...nodeElems, ...lineElems];
    }

    createLine(startNode, endNode) {
        const minLeft = Math.min(startNode.position.left, endNode.position.left);
        const maxLeft = Math.max(startNode.position.left, endNode.position.left);
        return (
            <svg key={`node_${startNode.key}_${endNode === startNode.left ? "left" : "right"}_line`}
                className="line-between-nodes-svg"
                height={TOP_MARGIN + NODE_SIZE}
                width={maxLeft - minLeft}
                style={{ left: (minLeft + NODE_SIZE / 2) + "px", top: (startNode.position.top + NODE_SIZE / 2) + "px" }}>
                <line
                    className="line-between-nodes"
                    x1={startNode.position.left - minLeft}
                    y1={0}
                    x2={endNode.position.left - minLeft}
                    y2={endNode.position.top - startNode.position.top}
                />
            </svg>
        )
    }

    render() {
        const { treeRoot } = this.props;
        return (
            <div className="tree-renderer" style={{ width: treeRoot.width + "px", height: TreeUtils.getTreeHeight(treeRoot) * (TOP_MARGIN + NODE_SIZE) + NODE_SIZE + "px" }}>
                {this.getElements()}
            </div>
        );
    }
}