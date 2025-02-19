import os
import json
import shutil
import subprocess
import sys

def run_command(command, cwd=None):
    """Run a shell command and handle errors."""
    try:
        subprocess.run(command, shell=True, check=True, cwd=cwd)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}\n{e}")
        sys.exit(1)

def remove_git_config():
    """Remove the .git directory to detach from the original repository."""
    git_path = ".git"
    if os.path.exists(git_path):
        shutil.rmtree(git_path)
        print("Removed .git directory to detach from the original repo.")

def update_package_json(new_name):
    """Update the name field in package.json."""
    package_json_path = "package.json"
    
    if not os.path.exists(package_json_path):
        print("Error: package.json not found!")
        sys.exit(1)

    with open(package_json_path, "r") as f:
        package_data = json.load(f)

    package_data["name"] = new_name

    with open(package_json_path, "w") as f:
        json.dump(package_data, f, indent=2)

    print(f"Updated package.json name to '{new_name}'.")

def clean_and_install_dependencies():
    """Remove node_modules and package-lock.json, then install dependencies."""
    node_modules_path = "node_modules"
    package_lock_path = "package-lock.json"

    if os.path.exists(node_modules_path):
        shutil.rmtree(node_modules_path)
    if os.path.exists(package_lock_path):
        os.remove(package_lock_path)

    print("Removed node_modules and package-lock.json.")
    print("Installing dependencies...")
    run_command("npm install")

def rename_project_directory(new_name):
    """Rename the current project directory to the new name."""
    current_dir = os.getcwd()
    parent_dir = os.path.dirname(current_dir)
    new_dir_path = os.path.join(parent_dir, new_name)

    if os.path.basename(current_dir) == new_name:
        print(f"Project directory is already named '{new_name}'. No changes needed.")
        return

    os.rename(current_dir, new_dir_path)
    print(f"Renamed project directory to '{new_name}'.")
    os.chdir(new_dir_path)  # Change working directory to the new name

def update_docker_compose_files(new_name):
    """Manually update image and container_name in docker-compose.dev.yml and docker-compose.prod.yml."""
    files = {
        "docker-compose.dev.yml": {
            "old_image": "auth-image-dev",
            "old_container": "auth-container-dev",
            "new_image": f"{new_name}-image-dev",
            "new_container": f"{new_name}-container-dev"
        },
        "docker-compose.prod.yml": {
            "old_image": "auth-image-prod",
            "old_container": "auth-container-prod",
            "new_image": f"{new_name}-image-prod",
            "new_container": f"{new_name}-container-prod"
        }
    }

    for file, values in files.items():
        if os.path.exists(file):
            with open(file, "r") as f:
                content = f.read()

            # Replace the old values with the new ones
            content = content.replace(values["old_image"], values["new_image"])
            content = content.replace(values["old_container"], values["new_container"])

            with open(file, "w") as f:
                f.write(content)

            print(f"Updated {file}:")
            print(f"  - Image: {values['new_image']}")
            print(f"  - Container: {values['new_container']}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python setup_nestjs.py <new_project_name>")
        sys.exit(1)

    new_project_name = sys.argv[1]

    # Remove Git tracking
    remove_git_config()

    # Update package.json
    update_package_json(new_project_name)

    # Rename the current project directory
    rename_project_directory(new_project_name)

    # Update Docker Compose files
    update_docker_compose_files(new_project_name)

    # Remove node_modules & package-lock.json, then install dependencies
    clean_and_install_dependencies()

    print("Project setup is complete!")

if __name__ == "__main__":
    main()
