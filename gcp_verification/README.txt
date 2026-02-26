# GCP Verification Instructions

1. **Connect to GCP**:
   Open your terminal and SSH into your GCP instance:
   ```bash
   ssh your_username@external_ip
   ```

2. **Upload Files**:
   Copy the `gcp_verification` folder to your GCP instance. You can use `scp` or simply create the files there using `nano`.

   **Method A (SCP):**
   Run this from your LOCAL terminal:
   ```bash
   scp -r s:/code/codeit_sprint/project-3/gcp_verification your_username@external_ip:~/
   ```

   **Method B (Copy-Paste):**
   On GCP, run:
   ```bash
   mkdir -p gcp_verification
   cd gcp_verification
   nano requirements.txt  # Paste content of requirements.txt
   nano verify_models.py  # Paste content of verify_models.py
   ```

3. **Install Dependencies**:
   On GCP, inside the `gcp_verification` folder:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set HuggingFace Token**:
   You need a token to download Flux/Qwen models.
   ```bash
   export HF_TOKEN="your_huggingface_token_here"
   ```

5. **Run Verification**:
   ```bash
   python verify_models.py
   ```

6. **Check Results**:
   - Look for "CUDA Available: Yes"
   - Look for "Model loaded successfully"
   - Check if `test_flux.png` was created.
