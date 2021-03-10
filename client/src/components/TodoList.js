import React, { useEffect, useState } from "react";
import ListItem from "./ListItem";
import "./TodoList.css";

export default function TodoList(props) {
  const [items, setItems] = useState([]);
  const [newitem, setnewItem] = useState("");

  //adding Tasks in the List and db
  const additem = () => {
    fetch("http://localhost:9999/todo", {
      method: "POST",
      body: JSON.stringify({ task: newitem }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((resp) => {
        items.push(resp);
        setItems([...items]);
        setnewItem("");
      });
  };

  //Taking Input fron Textarea
  const newitemchanged = (evt) => {
    setnewItem(evt.target.value);
  };

  //Deleting a Todo from db
  const deleteHandler = (itemIdx) => {
    const idToDelete = items[itemIdx]._id;
    fetch(`http://localhost:9999/todo/${idToDelete}`, {
      method: "DELETE",
      credentials: "include",
    }).then((r) => {
      items.splice(itemIdx, 1);
      setItems([...items]);
    });
  };

  //Updating a Todo
  const edithandler = (editedvalue, itemIdx) => {
    const idToEdit = items[itemIdx]._id;
    fetch(`http://localhost:9999/todo/${idToEdit}`, {
      method: "PUT",
      body: JSON.stringify({ task: editedvalue }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((resp) => {
        items[itemIdx] = resp;
        setItems([...items]);
      });
  };
  useEffect(() => {
    fetch("http://localhost:9999/todo", { credentials: "include" })
      .then((r) => r.json())
      .then((arr) => {
        // const sortedArr = arr.sort((a, b) => a.id - b.id);
        console.log("arr", arr);
        const sortedArr = arr.sort((a, b) => {
          const aDate = new Date(a.creationTime).valueOf();
          const bDate = new Date(b.creationTime).valueOf();
          return aDate - bDate;
        });
        setItems(sortedArr);
      });
  }, []);

  return (
    <div className="todo-container">
      <div className="user">
        <h5 className="username">Welcome {props.username}</h5>
        <button onClick={props.logoutHandler}>Logout</button>
      </div>
      <div className="addingBlock">
        <textarea
          className="task"
          onChange={newitemchanged}
          placeholder="Add Task"
          value={newitem}
        ></textarea>
        <button
          className="btn"
          onClick={additem}
          disabled={newitem.trim().length === 0}
        >
          Add
        </button>
      </div>
      <div className="listitem">
        {items.map((item, idx) => (
          <ListItem
            item={item}
            key={`${item._id}`}
            idx={idx}
            edithandler={edithandler}
            deleteHandler={deleteHandler}
          />
        ))}
      </div>
    </div>
  );
}
