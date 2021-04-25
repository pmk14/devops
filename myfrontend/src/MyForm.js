
import React, {useState, useEffect} from 'react';
import axios from 'axios';

const MyForm = (props) => {

    const [flowers, setFlowers] = useState([]);
    const [name, setName] = useState("");
    const [color, setColor] = useState("");
    const [flower, setFlower] = useState("");
    const [getId, setGetId] = useState(0);
    const [removeId, setRemoveId] = useState(0);
    const [removeLog, setRemoveLog] = useState("");
    const [updateLog, setUpdateLog] = useState("");
    const [updateId, setUpdateId] = useState(0);
    const [updateName, setUpdateName] = useState("");
    const [updateColor, setUpdateColor] = useState("");
    const [details, setDetails] = useState("");

    const handlePostSubmit = (event) => {
        console.log(`Flower to save ${name} ${color}`);
        event.preventDefault();
        axios.post('/api/flower', 
            {
                name: name,
                color: color,
            })
            .then(response => console.log(response))
            .catch(error => console.log(error));
    };

    const handleGetSubmit = (event) => {
        console.log(`Flower id to get ${getId}`);
        axios.get('/api/flower/' + getId)
            .then(response => {console.log(response); setFlower(response.data);})
            .catch(error => console.log(error));
    };

    const handleRemoveSubmit = (event) => {
        console.log(`Flower id to remove ${removeId}`);
        axios.delete('/api/flower/' + removeId)
            .then(response => {console.log(response); setRemoveLog(response.data);})
            .catch(error => console.log(error));
    };

    const handleUpdateSubmit = (event) => {
        console.log(`Flower id to update ${updateId} new name ${updateName} new color ${updateColor}`);
        axios.put('/api/flower', {id: updateId, name: updateName, color: updateColor})
            .then(response => {console.log(response); setUpdateLog(response.data);})
            .catch(error => console.log(error));
    };

    function handleDetails(id) {
        console.log(`Flower id to get ${id}`);
        axios.get('/api/flower/' + id)
            .then(response => {console.log(response); setDetails("Flower details: " + response.data);})
            .catch(error => console.log(error));
    };

    useEffect(() => {
        axios.get('/api/flowers')
            .then(response => setFlowers(response.data))
            .catch(error => console.log(error));
    }, []);

    return (
        <>
            
            Post a flower: <br/>
            name: <input type='text' value={name} onChange={event => setName(event.target.value)}/>
            color: <input type='text' value={color} onChange={event => setColor(event.target.value)}/>
            <input type='submit' value='Submit' onClick={handlePostSubmit}/> <br/>

            <br/><br/>
            Get a flower:<br/>
            id: <input type='text' value={getId} onChange={event => setGetId(event.target.value)}/>
            <input type='submit' value='Submit' onClick={handleGetSubmit}/> <br/>
            {flower} <br/>

            <br/><br/>
            Remove a flower:<br/>
            id: <input type='text' value={removeId} onChange={event => setRemoveId(event.target.value)}/>
            <input type='submit' value='Submit' onClick={handleRemoveSubmit}/> <br/>
            {removeLog} <br/>

            <br/><br/>
            Update flower name:<br/>
            id: <input type='text' value={updateId} onChange={event => setUpdateId(event.target.value)}/> <br/>
            new name: <input type='text' value={updateName} onChange={event => setUpdateName(event.target.value)}/>
            new color: <input type='text' value={updateColor} onChange={event => setUpdateColor(event.target.value)}/>
            <input type='submit' value='Submit' onClick={handleUpdateSubmit}/> <br/>
            {updateLog} <br/> <br/>

            <div>
                <br/> List of {props.noFlowers} flowers <br/> 
                {flowers
                    .slice(0, props.noFlowers)
                    .map(flower => (<div key={flower.id} onClick={() => handleDetails(flower.id)}>{flower.id} {flower.name}</div>))}

                    
                <br/>
                <br/>
                {details} <br/>
            </div>
        </>
    );

};

export default MyForm;