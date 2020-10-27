import React, { useState } from 'react';

import GraphView from './components/GraphView';
import NodeInformation from './components/NodeInformation';

const App = () => {
  const [node, setNode] = useState({});

  return (
    <>
      <GraphView setNode={setNode} />
      <NodeInformation node={node} />
    </>
  );
};

export default App;
