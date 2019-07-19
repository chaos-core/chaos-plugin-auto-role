const ChaosCore = require('chaos-core');

const localConfig = require('../config');

let bot = new ChaosCore({
  dataSource: {type: "memory"},
  ...localConfig,
});

bot.addPlugin(require('../index'));

bot.listen()
  .subscribe(
    () => {},
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      process.exit(1);
    },
    () => {
      process.exit(0);
    },
  );
