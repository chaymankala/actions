const exec = require("@actions/exec");
const core = require("@actions/core");

async function run() {
  const token = core.getInput("repo-token");
  const dockerfileLocation = core.getInput("dockerfile-location");
  const dockerfileName = core.getInput("dockerfile-name");
  const username = process.env.GITHUB_ACTOR;
  const imageName = core.getInput("image-name").toLowerCase();
  const githubRepo = process.env.GITHUB_REPOSITORY.toLowerCase();
  const tag = core.getInput("tag").toLowerCase();
  const fullImageReference = `ghcr.io/${githubRepo}:${tag}`;
  
  try {
    await exec.exec(
      `docker login ghcr.io -u ${username} -p ${token}`
    );
  } catch (err) {
    core.setFailed(`action failed with error: ${err}`);
  }

  try {
    if (!dockerfileName) {
      await exec.exec(
        `docker build -t ${fullImageReference} ${dockerfileLocation}`
      );
    } else{
      await exec.exec(
        `docker build -t ${fullImageReference} ${dockerfileLocation} -f ${dockerfileName}`
      );
    }
  } catch (err) {
    core.setFailed(`action failed with error: ${err}`);
  }

  try {
    await exec.exec(`docker push ${fullImageReference}`);
  } catch (err) {
    core.setFailed(`Review the logs above, most likely you are using a package name associated with a different repository.  Rename your Image to fix. https://help.github.com/en/github/managing-packages-with-github-packages/about-github-packages#managing-packages for more information`);
  }
  core.setOutput("imageUrl", fullImageReference);
}

run();

