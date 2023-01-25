import styled from 'styled-components';

export const StyledFilter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  input {
    max-width: 640px;
    width: 100%;
    font-size: 24px;
    outline: none;
    border: none;
    border-radius: 10px;
    padding: 15px 15px;
    margin: 0 2px 5px 0;

    ::placeholder {
      color: #c8c8c8;
    }
  }
`;
