async function run() {
  await new Promise(() => {
    process.stdout.write('Hello World!\n');
  });
}

run().catch(error => {
  process.stderr.write(error.stack + '\n');
  process.exit(1);
});
