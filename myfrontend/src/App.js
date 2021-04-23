import { useState } from 'react';
import './App.css';
import Post from './Post';
import MyForm from './MyForm';

function App() {

  const [ initialValue, setInitialValue ] = useState(2)

  const handleInitialValue = (event) => {
    setInitialValue(event.target.value);
  };

  return (
    <div>
      <br/>
      How many flowers you want to list? <input onChange={handleInitialValue}/> <br/>
      <MyForm noFlowers={initialValue} changeParentHandler={setInitialValue}/>

    </div>
  );
}

export default App;
