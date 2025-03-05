import xapi from 'xapi';

// Configuration
const switchIp = '169.254.1.254';  // Replace with your switch IP address
const restconfUsername = 'username';  // Replace with your RESTCONF username
const restconfPassword = 'password';  // Replace with your RESTCONF password

// Function to get the hostname using RESTCONF
function checkSwitch() {
  const url = `https://${switchIp}/restconf/data/Cisco-IOS-XE-native:native/hostname`;

  xapi.command('HttpClient Get', { 
    Url: url, 
    Header: [
      'Accept: application/yang-data+json',
      `Authorization: Basic ${btoa(`${restconfUsername}:${restconfPassword}`)}`
    ],
    AllowInsecureHTTPS: true
  })
  .then(response => {
    const jsonResponse = JSON.parse(response.Body);
    const hostname = jsonResponse['Cisco-IOS-XE-native:hostname'];
    console.log('Switch hostname:', hostname);
  })
  .catch(error => {
    console.error('Failed to get hostname:', error.message);
  });
}

// Execute the function to get the hostname
checkSwitch();