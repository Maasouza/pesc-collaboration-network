import React, { useState } from 'react';

import GraphView from './components/GraphView';
import NodeInformation from './components/NodeInformation';
import AboutProject from './components/AboutProject';

const App = () => {
  const [node, setNode] = useState({});

  return (
    <>
      <GraphView setNode={setNode} />
      <NodeInformation node={node} />
      <AboutProject />
    </>
  );
};

export default App;
