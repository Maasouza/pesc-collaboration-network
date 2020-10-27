import React from 'react';

const NodeInformation = ({ node }) => {
  return (
    <div>
      <h3>Nome</h3>
      <p>{node.id || '-'}</p>
      <h3>Campo</h3>
      <p>{node.field || '-'}</p>
      <h3>Grau</h3>
      <p>{node.degree || '-'}</p>
    </div>
  );
};

export default NodeInformation;
