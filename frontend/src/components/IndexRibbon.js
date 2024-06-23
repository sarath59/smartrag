import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const RibbonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;

const IndexItem = styled.div`
  padding: 10px;
  margin-bottom: 5px;
  background-color: ${props => props.selected ? '#0078D7' : '#e0e0e0'};
  color: ${props => props.selected ? 'white' : 'black'};
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    background-color: ${props => props.selected ? '#0078D7' : '#d0d0d0'};
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.selected ? 'white' : '#666'};
  cursor: pointer;
  padding: 5px;
  &:hover {
    color: #ff0000;
  }
`;

const CreateIndexForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const Input = styled.input`
  padding: 5px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background-color: #0078D7;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const StyledCheckbox = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #0078D7;
  border-radius: 3px;
  margin-right: 10px;
  cursor: pointer;
  position: relative;
  &:checked {
    background-color: #0078D7;
  }
  &:checked::after {
    content: '✓';
    position: absolute;
    color: white;
    font-size: 16px;
    top: -2px;
    left: 3px;
  }
`;

const CheckboxLabel = styled.label`
  cursor: pointer;
`;

function IndexRibbon({ indexes, selectedIndex, onSelectIndex, onIndexesChange, onDeleteIndex }) {
  const [newIndexName, setNewIndexName] = useState('');
  const [isRestricted, setIsRestricted] = useState(true);

  const handleCreateIndex = async (e) => {
    e.preventDefault();
    if (!newIndexName) return;
    try {
      const response = await fetch('/indexes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newIndexName, is_restricted: isRestricted })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.message);
      setNewIndexName('');
      onIndexesChange();
    } catch (error) {
      console.error('Error creating index:', error);
    }
  };

  const handleDeleteIndex = async (indexName, isRestricted) => {
    if (window.confirm(`Are you sure you want to delete the index "${indexName}"?`)) {
      try {
        const response = await fetch(`/indexes/${indexName}?is_restricted=${isRestricted}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.message);
        onDeleteIndex(indexName, isRestricted);
      } catch (error) {
        console.error('Error deleting index:', error);
      }
    }
  };

  return (
    <RibbonContainer>
      {indexes.map((index, i) => (
        <IndexItem
          key={i}
          selected={selectedIndex && selectedIndex[0] === index[0] && selectedIndex[1] === index[1]}
          onClick={() => onSelectIndex(index)}
        >
          <span>{index[0]} ({index[1] ? 'Restricted' : 'Open'})</span>
          <DeleteButton
            selected={selectedIndex && selectedIndex[0] === index[0] && selectedIndex[1] === index[1]}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteIndex(index[0], index[1]);
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </DeleteButton>
        </IndexItem>
      ))}
      <CreateIndexForm onSubmit={handleCreateIndex}>
        <Input
          type="text"
          value={newIndexName}
          onChange={(e) => setNewIndexName(e.target.value.toLowerCase())}
          placeholder="New index name (max 10 chars)"
          maxLength="10"
        />
        <CheckboxContainer>
          <StyledCheckbox
            type="checkbox"
            id="restrictedCheckbox"
            checked={isRestricted}
            onChange={(e) => setIsRestricted(e.target.checked)}
          />
          <CheckboxLabel htmlFor="restrictedCheckbox">Restricted</CheckboxLabel>
        </CheckboxContainer>
        <Button type="submit">Create Index</Button>
      </CreateIndexForm>
    </RibbonContainer>
  );
}

export default IndexRibbon;