
import React, {useState, useEffect} from 'react';
import axios from 'axios';

const MyForm = (props) => {

    const [flowers, setFlowers] = useState([]);
    const [name, setName] = useState("");
    const [flower, setFlower] = useState("");
    const [getId, setGetId] = useState(0);
    const [removeId, setRemoveId] = useState(0);
    const [removeLog, setRemoveLog] = useState("");
    const [updateLog, setUpdateLog] = useState("");
    const [updateId, setUpdateId] = useState(0);
    const [updateName, setUpdateName] = useState("");

    const handlePostSubmit = (event) => {
        console.log(`Flower to save ${name}`);
        event.preventDefault();
        axios.post('http://127.0.0.1:4000/flower', 
            {
                name: name,
            })
            .then(response => console.log(response))
            .catch(error => console.log(error));
    };

    const handleGetSubmit = (event) => {
        console.log(`Flower id to get ${getId}`);
        axios.get('http://127.0.0.1:4000/flower/' + getId)
            .then(response => {console.log(response); setFlower(response.data);})
            .catch(error => console.log(error));
    };

    const handleRemoveSubmit = (event) => {
        console.log(`Flower id to remove ${removeId}`);
        axios.delete('http://127.0.0.1:4000/flower/' + removeId)
            .then(response => {console.log(response); setRemoveLog(response.data);})
            .catch(error => console.log(error));
    };

    const handleUpdateSubmit = (event) => {
        console.log(`Flower id to update ${updateId} new name ${updateName}`);
        axios.put('http://127.0.0.1:4000/flower', {id: updateId, name: updateName})
            .then(response => {console.log(response); setUpdateLog(response.data);})
            .catch(error => console.log(error));
    };

    useEffect(() => {
        axios.get('http://127.0.0.1:4000/flowers')
            .then(response => setFlowers(response.data))
            .catch(error => console.log(error));
    }, []);

    return (
        <>
            
            Post a flower:
            <input type='text' value={name} onChange={event => setName(event.target.value)}/>
            <input type='submit' value='Submit' onClick={handlePostSubmit}/> <br/>

            Get a flower:
            <input type='text' value={getId} onChange={event => setGetId(event.target.value)}/>
            <input type='submit' value='Submit' onClick={handleGetSubmit}/> <br/>
            Your result:   {flower} <br/> <br/>

            Remove a flower:
            <input type='text' value={removeId} onChange={event => setRemoveId(event.target.value)}/>
            <input type='submit' value='Submit' onClick={handleRemoveSubmit}/> <br/>
            Your result:   {removeLog} <br/> <br/>

            Update flower name:
            id: <input type='text' value={updateId} onChange={event => setUpdateId(event.target.value)}/>
            new name: <input type='text' value={updateName} onChange={event => setUpdateName(event.target.value)}/>
            <input type='submit' value='Submit' onClick={handleUpdateSubmit}/> <br/>
            Your result:   {updateLog} <br/> <br/>

            <div>
                <br/> List of {props.noFlowers} flowers <br/> 
                {flowers
                    .slice(0, props.noFlowers)
                    .map(flower => (<div key={flower.id}>{flower.id} {flower.name}</div>))}
            </div>
        </>
    );

};

export default MyForm;