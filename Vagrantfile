VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
    config.vm.define "microk8s-vm" do |microk8s|
        microk8s.vm.box = "ubuntu/bionic64"
        microk8s.vm.hostname = "microk8s-vm"
        microk8s.vm.network "private_network", ip: "192.168.33.30" 
     
        microk8s.vm.provider "virtualbox" do |vb, override|
            vb.name = "microk8s"
            vb.memory = 8192
            vb.cpus = 2

            override.vm.synced_folder ".", "/vagrant"    
        end
     
        microk8s.vm.provision "shell", inline: <<-EOF
            snap install microk8s --classic
            snap install docker

            microk8s.status --wait-ready
            microk8s.enable ingress registry
            usermod -a -G microk8s vagrant

            echo "alias kubectl='microk8s.kubectl'" > /home/vagrant/.bash_aliases
            chown vagrant:vagrant /home/vagrant/.bash_aliases
            echo "alias kubectl='microk8s.kubectl'" > /root/.bash_aliases
            
            chmod 666 /var/run/docker.sock
            chmod 666 /var/snap/microk8s/common/run/containerd.sock

            microk8s.kubectl patch cm nginx-ingress-tcp-microk8s-conf -n ingress --patch-file /vagrant/webcasting-routing-dev/microk8s-ingress-tuning/ingress-config-map-tuning.yaml
            microk8s.kubectl patch ds nginx-ingress-microk8s-controller -n ingress --patch-file /vagrant/webcasting-routing-dev/microk8s-ingress-tuning/ingress-daemon-set-tuning.yaml
            microk8s.kubectl config view --raw > /vagrant/config

            echo "127.0.0.1 ovp3-webcasting.dblabs.net" >> /etc/hosts
            sed -i 's/localhost:32000/ovp3-webcasting.dblabs.net:32000/g' /var/snap/microk8s/current/args/containerd-template.toml

            microk8s stop
            microk8s start

            chown root:root /root/.bash_aliases
        EOF
    end
end