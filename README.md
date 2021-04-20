### OVP3 webcasting project

#### Main modules:
- Wowza [webcasting-wowza directory]
- streamer [webcasting-streamer directory]
- viewer [webcasting-viewer directory]
- routing [webcasting-routing directory]

#### Preparations:

##### Bootsrap
For installing the needed dependencies and making the needed configuration changes and tuning you should use a bootstrap script.

<b>If you are MacOS user:</b> 
- open the App Store application and install the latest version of XCode
- install Docker desktop from here (https://docs.docker.com/docker-for-mac/install/) and start it
- disable the build-in macos firewall (System Preferences -> Security & Privacy -> Firewall -> Turn Off Firewall)
- turn off the Cisco AnyConnect VPN client
- use the command below:

<code>./bootstrap-macos.sh</code>

<b>If you are Linux user</b> you should use the command below:

<code>./bootstrap-linux.sh</code>

##### Configuration file:
You should change a configuration file. Edit the <code>webcasting-wowza/charts/values/values-dev.yaml</code> file and set your Wowza development license key.

#### How to run
For starting project in the development mode you can use:

<code>./start.sh</code>

#### Main web pages:
After you started the project these web pages are available:
- https://ovp3-wowza.dblabs.net/enginemanager/login.htm
Wowza Streaming Engine manager. The credentials are: <code>wowza</code>/<code>wowza</code>. The Wowza Streamin Engine url is: <code>http://ovp3-wowza.dblabs.net:8087</code>
- https://ovp3-webcasting.dblabs.net/streamer/
Streamer web page
- https://ovp3-webcasting.dblabs.net/viewer/
Viewer web page