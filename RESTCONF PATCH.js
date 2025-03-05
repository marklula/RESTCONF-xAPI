import xapi from 'xapi';

// CONFIGURATION
const SWITCH_IP = '169.254.1.254';  // Replace with your switch's IP address
const USERNAME = 'username';         // Switch username
const PASSWORD = 'password';      // Switch password
const INTERFACE = '1/0/1';        // Target interface (e.g., '1/0/1' for GigabitEthernet1/0/1)
const VLAN_ID = 200;              // Desired VLAN ID (as a number)

// RESTCONF API URL
const API_URL = `https://${SWITCH_IP}/restconf/data/Cisco-IOS-XE-native:native/interface/GigabitEthernet`;

// Encode credentials for Basic Authentication
function encodeBase64(str) {
    return btoa(str);
}

// Basic Authentication Header
const AUTH = 'Basic ' + encodeBase64(`${USERNAME}:${PASSWORD}`);

// Function to Change VLAN
async function changeVLAN() {
    const payload = {
      "Cisco-IOS-XE-native:GigabitEthernet":[{
        "name":"1/0/1",
        "switchport": {
          "Cisco-IOS-XE-switch:access":{
            "vlan":{
              "vlan":VLAN_ID
            }
          }
        }
      }]
    };
 
    try {
        const response = await xapi.Command.HttpClient.Patch({
            Header: [
                'Content-Type: application/yang-data+json',
                'Accept: application/yang-data+json',
                `Authorization: ${AUTH}`
            ],
            Url: API_URL,
            AllowInsecureHTTPS: true,
            ResultBody: 'PlainText'
        },JSON.stringify(payload));

        if (response.StatusCode == "204") {
            xapi.Command.UserInterface.Message.Alert.Display({
                Title: 'VLAN Changed',
                Text: `Interface GigabitEthernet${INTERFACE} set to VLAN ${VLAN_ID}`,
                Duration: 5
            });
        } else {
            throw new Error(`HTTP Error: ${response.StatusCode} - ${response.StatusText}`);
        }
    } catch (error) {
        xapi.Command.UserInterface.Message.Alert.Display({
            Title: 'Error',
            Text: `Failed to change VLAN: ${error.message}`,
            Duration: 5
        });
    }
}

// UI Button to Trigger VLAN Change
xapi.Event.UserInterface.Extensions.Panel.Clicked.on(event => {
    if (event.PanelId === 'ChangeVLAN') {
        changeVLAN();
    }
});

// Panel Creation XML
const PANEL_XML = `
<Extensions>
    <Version>1.7</Version>
    <Panel>
        <Order>1</Order>
        <PanelId>ChangeVLAN</PanelId>
        <Type>Home</Type>
        <Icon>Network</Icon>
        <Color>#FF5733</Color>
        <Name>Change VLAN</Name>
        <ActivityType>Custom</ActivityType>
    </Panel>
</Extensions>
`;

// Save the panel
xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'ChangeVLAN', body: PANEL_XML });
