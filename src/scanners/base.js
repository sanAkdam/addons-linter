import { NotImplentedError } from 'exceptions';
import { ensureFilenameExists, ignorePrivateFunctions } from 'utils';


export default class BaseScanner {

  constructor(contents, filename, options={}) {
    this.contents = contents;
    this.filename = filename;
    this.options = options;
    this.linterMessages = [];
    this._defaultRules = [];
    this._parsedContent = null;
    this._rulesProcessed = 0;

    ensureFilenameExists(this.filename);
  }

  scan(_rules=this._defaultRules) {
    return new Promise((resolve, reject) => {
      this.getContents()
        .then((contents) => {
          var promises = [];
          // Ignore private functions exported in rule files.
          //
          // (These are exported for testing purposes, but we don't want
          // to include them in our linter's rules.)
          var rules = ignorePrivateFunctions(_rules);

          for (let rule in rules) {
            this._rulesProcessed++;

            promises.push(rules[rule](contents, this.filename,
                                      this.options));
          }

          return Promise.all(promises);
        })
        .then((ruleResults) => {
          for (let messages of ruleResults) {
            this.linterMessages = this.linterMessages.concat(messages);
          }

          resolve(this.linterMessages);
        })
        .catch(reject);
    });
  }

  getContents() {
    return new Promise((resolve, reject) => {
      if (this._parsedContent !== null) {
        return resolve(this._parsedContent);
      }

      this._getContents()
        .then((contents) => {
          this._parsedContent = contents;

          resolve(this._parsedContent);
        })
        .catch(reject);
    });
  }

  _getContents() {
    return Promise.reject(
      new NotImplentedError('_getContents is not implemented'));
  }

}