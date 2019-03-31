const NixCore = require('nix-core');
const Path = require('path');

const localConfig = require('../config');

let bot = new NixCore({
  dataSource: {
    type: "disk",
    dataDir: Path.join(__dirname, '../data'),
  },
  ...localConfig
});

bot.addModule(require('../index'));

bot.listen()
  .subscribe(
    () => {},
    (error) => {
      console.error(error);
      process.exit(1);
    },
    () => {
      process.exit(0);
    },
  );
