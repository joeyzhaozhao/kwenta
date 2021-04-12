FROM wowzamedia/wowza-streaming-engine-linux:latest 

COPY conf/Server.xml              /usr/local/WowzaStreamingEngine/conf/Server.xml
COPY conf/VHost.xml               /usr/local/WowzaStreamingEngine/conf/VHost.xml
COPY conf/log4j2-config.xml       /usr/local/WowzaStreamingEngine/conf/log4j2-config.xml
COPY conf/entrypoint.sh           /sbin/entrypoint.sh

COPY conf/wowza-keystore.jks      /usr/local/WowzaStreamingEngine/conf/keystore.jks

COPY conf/live/Application.xml    /usr/local/WowzaStreamingEngine/conf/live/Application.xml
COPY conf/live/transcode.xml      /usr/local/WowzaStreamingEngine/conf/live/transcode.xml

CMD sh /sbin/entrypoint.sh
