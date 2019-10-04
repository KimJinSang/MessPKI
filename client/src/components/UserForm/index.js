import React from 'react';

const UserForm = ({ ...rest }) => {
  return (
    <form {...rest}>
      <ul>
        <li>이름: <input type='text' name='name' defaultValue='홍길동' /></li>
        <li>이메일: <input type='email' name='email' defaultValue='test@test.com' /></li>
        <li><input type='submit' value='확인' /></li>
      </ul>
    </form>
  );
}

export default UserForm;