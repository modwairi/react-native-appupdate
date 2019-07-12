'use strict';

import {
  NativeModules,
  Platform,
  Linking,
} from 'react-native';
import RNFS from 'react-native-fs';

const RNAppUpdate = NativeModules.RNAppUpdate;

let jobId = -1;

class AppUpdate {
  constructor(options) {
    this.options = options;
  }

  GET(url, success, error) {
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        success && success(json);
      })
      .catch((err) => {
        error && error(err);
      });
  }

  getApkVersion() {
    if (jobId !== -1) {
      return;
    }
    if (!this.options.apkVersionUrl) {
      console.log("apkVersionUrl doesn't exist.");
      return;
    }
    this.GET(this.options.apkVersionUrl, this.getApkVersionSuccess.bind(this), this.getVersionError.bind(this));
  }

  getApkVersionSuccess(remote) {
    console.log("getApkVersionSuccess", remote);
    if (RNAppUpdate.versionCode < parseInt(remote.androidVersion.version)) {
      if (this.options.needUpdateApp) {
        this.options.needUpdateApp((isUpdate) => {
          if (isUpdate) {
            this.goToPlayStore(remote);
          }
        });
      }
    } else if(this.options.notNeedUpdateApp) {
      this.options.notNeedUpdateApp();
    }
  }

  goToPlayStore(remote){
    Linking.openURL('https://play.google.com/store/apps/details?id=com.queencar.users');
  }

  getAppStoreVersion() {
    this.GET(`https://itunes.apple.com/search?term=queencar&entity=software`, this.getAppStoreVersionSuccess.bind(this), this.getVersionError.bind(this));
  }

  getAppStoreVersionSuccess(data) {
    if (data.resultCount < 1) {
      console.log("iosAppId is wrong.");
      return;
    }
    const result = data;
    const version = parseInt(result.results[0].version);
    
    if (version > RNAppUpdate.versionCode) {
      if (this.options.needUpdateApp) {
        this.options.needUpdateApp((isUpdate) => {
          if (isUpdate) {
            Linking.openURL('https://apps.apple.com/us/app/queen-car/id1410192184');
          }
        });
      }
    }
  }

  getVersionError(err) {
    console.log("getVersionError", err);
  }

  checkUpdate() {
    if (Platform.OS === 'android') {
      this.getApkVersion();
    } else {
      this.getAppStoreVersion();
    }
  }
}

export default AppUpdate;
