// Copyright 2020 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Service to manage the current language being
 * used for content translations.
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';

import { ContentTranslationManagerService } from
  'pages/exploration-player-page/services/content-translation-manager.service';
import { ExplorationLanguageInfo } from
  'pages/exploration-player-page/services/audio-translation-language.service';
import { LanguageUtilService } from 'domain/utilities/language-util.service';


@Injectable({
  providedIn: 'root'
})
export class ContentTranslationLanguageService {
  constructor(
    private languageUtilService: LanguageUtilService,
    private contentTranslationManagerService: ContentTranslationManagerService
  ) {}

  _currentContentLanguageCode: string = null;
  _explorationLanguageCode: string = null;
  _languageOptions: ExplorationLanguageInfo[] = [];

  _init(
      allContentLanguageCodesInExploration: string[],
      preferredContentLanguageCodes: string[],
      preferredSiteLanguageCode: string,
      explorationLanguageCode: string
  ): void {
    this._currentContentLanguageCode = null;
    this._explorationLanguageCode = explorationLanguageCode;
    this._languageOptions = [];
    // Set the content language that is chosen initially.
    // Use the following priority (highest to lowest):
    // 1. Preferred content languages.
    // 2. Preferred site language.
    // 3. Otherwise, the exploration language code.
    if (preferredContentLanguageCodes !== null) {
      for (const languageCode of preferredContentLanguageCodes) {
        if (allContentLanguageCodesInExploration.includes(languageCode)) {
          this._currentContentLanguageCode = languageCode;
          break;
        }
      }
    }

    if (
      this._currentContentLanguageCode === null &&
      preferredSiteLanguageCode !== null &&
      allContentLanguageCodesInExploration.includes(preferredSiteLanguageCode)
    ) {
      this._currentContentLanguageCode = preferredSiteLanguageCode;
    }

    if (
      this._currentContentLanguageCode === null &&
      explorationLanguageCode !== null
    ) {
      this._currentContentLanguageCode = explorationLanguageCode;
    }

    allContentLanguageCodesInExploration.push(explorationLanguageCode);
    allContentLanguageCodesInExploration.forEach(
      (languageCode: string) => {
        let languageDescription =
            this.languageUtilService.getContentLanguageDescription(
              languageCode);
        this._languageOptions.push({
          value: languageCode,
          displayed: languageDescription
        });
      });
  }

  init(
      allContentLanguageCodesInExploration: string[],
      preferredContentLanguageCodes: string[],
      preferredSiteLanguageCode: string,
      explorationLanguageCode: string): void {
    this._init(
      allContentLanguageCodesInExploration, preferredContentLanguageCodes,
      preferredSiteLanguageCode, explorationLanguageCode);
    this.contentTranslationManagerService.init(explorationLanguageCode);
  }

  /**
   * @return {string} The current audio language code (eg. en).
   */
  getCurrentContentLanguageCode(): string {
    return this._currentContentLanguageCode;
  }

  /**
   * @return {Array<ExplorationLanguageInfo>}
   * An array of ExplorationLanguageInfo objects which consist of audio
   * language codes as well as their displayed language description for
   * the exploration.
   */
  getLanguageOptionsForDropdown(): ExplorationLanguageInfo[] {
    return this._languageOptions;
  }

  /**
   * @param {string} set a new language code.
   */
  setCurrentContentLanguageCode(newLanguageCode: string): void {
    if (this._currentContentLanguageCode !== newLanguageCode) {
      this.contentTranslationManagerService.displayTranslations(
        newLanguageCode);
      this._currentContentLanguageCode = newLanguageCode;
    }
  }
}

angular.module('oppia').factory(
  'ContentTranslationLanguageService',
  downgradeInjectable(ContentTranslationLanguageService));
