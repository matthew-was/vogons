const program = require('commander');
const ursa = require('ursa');
const config = require('m3.intl.config');

const data = config.get('data');

function insertLFEveryChars(key, lineLength) {
  if (key.length > lineLength) {
    return `${key.substr(0, lineLength)}\r
${insertLFEveryChars(key.substr(lineLength), lineLength)}`;
  }
  return key;
}

function getPublicKey(name) {
  const keyRaw = config.get('keys')[name];
  return `-----BEGIN PUBLIC KEY-----
${insertLFEveryChars(keyRaw, 64)}\r
-----END PUBLIC KEY-----`;
}

function getPrivateKey(name) {
  const keyRaw = config.get('keys')[name];
  return `-----BEGIN RSA PRIVATE KEY-----
${insertLFEveryChars(keyRaw, 64)}\r
-----END RSA PRIVATE KEY-----`;
}


function encryptPayload(payloadAsJSONString) {
  const keyStr = getPublicKey('publicKey');
  const key = ursa.createPublicKey(keyStr);
  return key.encrypt(
    new Buffer(payloadAsJSONString, 'utf8'), 'utf8', 'base64', ursa.RSA_PKCS1_PADDING
  );
}

function decryptPayload(payload) {
  const keyStr = getPrivateKey('privateKey');
  const key = ursa.createPrivateKey(keyStr);
  return key.decrypt(
    new Buffer(payload, 'base64'), 'base64', 'utf8', ursa.RSA_PKCS1_PADDING
  );
}

program
  .command('decrypt')
  .description('Decrypt the data in config.json using supplied private key')
  .action(() => {
    console.log('Starting decryption');
    console.log(`Using data: ${data}`);
    const response = decryptPayload(data);
    console.log(`Result: ${response}`);
  });

program
  .command('encrypt')
  .description('Encrypt the data in config.json using supplied public key')
  .action(() => {
    console.log('Starting decryption');
    console.log(`Using data: ${data}`);
    const response = encryptPayload(JSON.stringify(data));
    console.log(`Result: ${response}`);
  });

program.parse(process.argv);
