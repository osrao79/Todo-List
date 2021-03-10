import React, { useState } from "react";
import "./ListItem.css";

function ListItem(props) {
  const [editedItem, setEditedItem] = useState(props.item.task);
  const [editMode, setEditMode] = useState(false);

  const editedItemChanged = (evt) => {
    setEditedItem(evt.target.value);
  };
  const saveEditedItem = () => {
    // props.editHandler(editedItem, props.idx);

    setEditMode(false);
  };
  return (
    <div className="list">
      {editMode ? (
        <>
          <div className="listitem">
            <textarea
              className="editTask"
              onChange={editedItemChanged}
              placeholder="Edit Task"
              value={editedItem}
            ></textarea>
          </div>
          <div className="listactions">
            <button
              className="saveTask"
              onClick={saveEditedItem}
              disabled={editedItem.trim().length === 0}
            >
              Save Task
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="listitem">{props.item.task}</div>
          <div className="listactions">
            <button className="edit" onClick={() => setEditMode(true)}>
              Edit
            </button>
            <button
              className="delete"
              onClick={() => props.deleteHandler(props.idx)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ListItem;
