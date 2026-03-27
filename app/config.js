export const CONFIG = {
  appTitle: 'Prüfungserfassung (Test)',
  primaryKey: 'fuehrerscheinnummer',
  dataPaths: {
    baureihen: 'assets/data/baureihen.json',
    evuBv: 'assets/data/evu_bv.json',
    pruefarten: 'assets/data/pruefarten.json',
    netzteile: 'assets/data/netzteile.json'
  },
  submission: {
    mode: 'download', // 'download' | 'webhook'
    webhookUrl: ''
  }
};
