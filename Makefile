# Creates (or updates) secrets object on the k8s cluster server
upsert-secrets:
	kubectl apply -n tessa-backend -f secrets/secrets.yml