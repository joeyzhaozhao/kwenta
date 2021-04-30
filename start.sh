if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    skaffold dev --default-repo localhost:32000 --namespace=ovp3-webcasting
elif [[ "$OSTYPE" == "darwin"* ]]; then
    skaffold dev --default-repo ovp3-webcasting.dblabs.net:32000 --namespace=ovp3-webcasting    
fi