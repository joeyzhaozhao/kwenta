# update xcode tools 
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install

# install homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

# install gnu sed
brew install gsed

# install vagrant
brew install --cask virtualbox
brew install --cask vagrant

# start vagrant vm for microk8s
vagrant up

# install microk8s
brew install ubuntu/microk8s/microk8s
microk8s install

# delete multipass vm
multipass delete microk8s-vm
multipass purge

# change microk8s config
gsed -i 's/127.0.0.1/192.168.33.30/' config
cp config $HOME/.microk8s/config

# add kubectl alias locally
echo 'alias kubectl="microk8s kubectl"' >> ~/.bash_profile
source ~/.bash_profile

# create default webcasting namespace
kubectl create namespace ovp3-webcasting

# create k8s config for skaffold
mv config $HOME/.kube/config

# install skaffold
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-darwin-amd64 && \
sudo install skaffold /usr/local/bin/

# install helm
brew install helm

# modify hosts
KUBE_CLUSTER_IP=192.168.33.30
echo "K8s cluster ip: $KUBE_CLUSTER_IP"
echo "$KUBE_CLUSTER_IP    ovp3-webcasting.dblabs.net" | sudo tee -a /etc/hosts
echo "$KUBE_CLUSTER_IP    ovp3-wowza.dblabs.net" | sudo tee -a /etc/hosts

# add cluster IP as ICE candidate IP
cp webcasting-wowza/charts/values/values.tpl webcasting-wowza/charts/values/values-dev.yaml
echo "wowzaIceIp: $KUBE_CLUSTER_IP" >> webcasting-wowza/charts/values/values-dev.yaml

# add insecure registry to docker config
echo "{\"insecure-registries\":[\"ovp3-webcasting.dblabs.net:32000\"]}" > ~/.docker/daemon.json 
killall Docker && open /Applications/Docker.app