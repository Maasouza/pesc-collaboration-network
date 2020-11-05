import React from 'react';

import './styles.css';

const NodeInformation = ({ node }) => {
  return (
    <div className="information-container">
      <div style={{ width: '40%' }}>
        <p className="node-property-name">Nome</p>
        <p className="node-property-value">{node.id || '-'}</p>
      </div>
      <div style={{ width: '40%' }}>
        <p className="node-property-name">Área de atuação</p>
        <p className="node-property-value">{node.field || '-'}</p>
      </div>
      <div>
        <p className="node-property-name">Grau de colaboração</p>
        <p className="node-property-value">{node.degree || '-'}</p>
      </div>
    </div>
  );
};

export default NodeInformation;
