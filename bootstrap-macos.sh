# update xcode tools 
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install

# install homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

# install virtual box (we will need a network driver from it) 
brew install --cask virtualbox

# install multipass
brew install --cask multipass
# set another network driver for microk8s (see https://github.com/ubuntu/microk8s/issues/1368)
sudo multipass set local.driver=virtualbox

# install microk8s
brew install ubuntu/microk8s/microk8s
microk8s install

# add kubectl alias locally
echo 'alias kubectl="microk8s kubectl"' >> ~/.bash_profile
source ~/.bash_profile

# check microk8s status
microk8s status --wait-ready

# activate microk8s plugins
microk8s enable ingress
microk8s enable registry

# install docker
# brew install --cask docker

# create default webcasting namespace
kubectl create namespace ovp3-webcasting

# create k8s config for skaffold
kubectl config view --raw > $HOME/.kube/config

# install skaffold
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-darwin-amd64 && \
sudo install skaffold /usr/local/bin/

# install helm
brew install helm

# tune ingress
kubectl patch cm nginx-ingress-tcp-microk8s-conf -n ingress --patch "$(cat webcasting-routing-dev/microk8s-ingress-tuning/ingress-config-map-tuning.yaml)"
kubectl patch ds nginx-ingress-microk8s-controller -n ingress --patch "$(cat webcasting-routing-dev/microk8s-ingress-tuning/ingress-daemon-set-tuning.yaml)"

# modify hosts
KUBE_CLUSTER_IP=$(multipass info microk8s-vm | grep -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' | head -1)
echo "K8s cluster ip: $KUBE_CLUSTER_IP"
echo "$KUBE_CLUSTER_IP       ovp3-webcasting.dblabs.net" | sudo tee -a /etc/hosts
echo "$KUBE_CLUSTER_IP       ovp3-wowza.dblabs.net" | sudo tee -a /etc/hosts

# add cluster IP as ICE candidate IP
cp webcasting-wowza/charts/values/values.tpl webcasting-wowza/charts/values/values-dev.yaml
echo "wowzaIceIp: $KUBE_CLUSTER_IP" >> webcasting-wowza/charts/values/values-dev.yaml

# modify VM hosts
multipass exec microk8s-vm -- sudo bash -c 'echo "127.0.0.1 ovp3-webcasting.dblabs.net" >> /etc/hosts'

# add insecure registry to docker config
echo "{\"insecure-registries\":[\"ovp3-webcasting.dblabs.net:32000\"]}" > ~/.docker/daemon.json 
killall Docker && open /Applications/Docker.app

# add insecure registry to microk8s config
multipass exec microk8s-vm -- sudo sed -i 's/localhost:32000/ovp3-webcasting.dblabs.net:32000/g' /var/snap/microk8s/current/args/containerd-template.toml 
multipass exec microk8s-vm -- sudo microk8s stop
multipass exec microk8s-vm -- sudo microk8s start

