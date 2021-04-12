if [ "$(whoami)" != "root" ]; then
  tput setaf 1;
  echo "Please run this script as root user"
  tput sgr 0;

  exit 1
fi

# install microk8s
snap install microk8s --classic
snap alias microk8s.kubectl kubectl

# start microk8s
microk8s start
microk8s status --wait-ready

# activate microk8s plugins
microk8s.enable ingress
microk8s.enable registry

# install docker 
snap install docker

# create default webcasting namespace
kubectl create namespace ovp3-webcasting

# create k8s config for skaffold
mkdir $HOME/.kube
kubectl config view --raw > $HOME/.kube/config 

# install skaffold
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64 && \
install skaffold /usr/local/bin/

# install helm
snap install helm --classic

# tune ingress
kubectl patch cm nginx-ingress-tcp-microk8s-conf -n ingress --patch-file webcasting-routing/ingress-tuning/ingress-config-map-tuning.yaml
kubectl patch ds nginx-ingress-microk8s-controller -n ingress --patch-file webcasting-routing/ingress-tuning/ingress-daemon-set-tuning.yaml

# modify hosts
echo "127.0.0.1       ovp3-webcasting.dblabs.net" >> /etc/hosts
echo "127.0.0.1       ovp3-wowza.dblabs.net" >> /etc/hosts

# add localhost as ICE candidate IP
cp webcasting-wowza/charts/values.tpl webcasting-wowza/charts/values.yaml
echo "wowzaIceIp: 127.0.0.1" >> webcasting-wowza/charts/values.yaml
