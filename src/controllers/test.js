const test = (req, res) => {
    console.log('OK');
    return res.status(200).send('OK');
  };

export default test;