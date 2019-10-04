const PKI = artifacts.require("PKI");

contract("PKI", accounts => {
  const [account1] = accounts;

  it("Set/Get User", async () => {
    const instance = await PKI.deployed();
    await instance.setUser.call(account1, '홍길동', 'test@test.com');
    const userInfo = await instance.getUser.call(account1);

    assert.notEqual(userInfo.name, '', 'User does not exist');
  });
});