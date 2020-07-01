// Copyright 2018 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Factory for creating new frontend instances of State
 * card domain objects used in the exploration player.
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';

import cloneDeep from 'lodash/cloneDeep';

import { AppConstants } from 'app.constants';
import { AudioTranslationLanguageService } from
  'pages/exploration-player-page/services/audio-translation-language.service';
import { Interaction } from 'domain/exploration/InteractionObjectFactory';
import { IBindableVoiceovers, RecordedVoiceovers } from
  'domain/exploration/RecordedVoiceoversObjectFactory';
import { IInteractionCustomizationArgs } from
  'interactions/customization-args-defs';
import { Hint } from 'domain/exploration/HintObjectFactory';
import { Solution } from 'domain/exploration/SolutionObjectFactory';

const INTERACTION_SPECS = require('interactions/interaction_specs.json');

export interface IInputResponsePair {
  learnerInput: string,
  oppiaResponse: string,
  isHint: boolean
}

export class StateCard {
  _stateName: string;
  _contentHtml: string;
  _interactionHtml: string;
  _interaction: Interaction;
  _inputResponsePairs: Array<IInputResponsePair>;
  _recordedVoiceovers: RecordedVoiceovers;
  _contentId: string;
  _completed: boolean;
  audioTranslationLanguageService: AudioTranslationLanguageService;
  constructor(
      stateName, contentHtml, interactionHtml, interaction: Interaction,
      inputResponsePairs: Array<IInputResponsePair>,
      recordedVoiceovers: RecordedVoiceovers, contentId: string,
      audioTranslationLanguageService: AudioTranslationLanguageService) {
    this._stateName = stateName;
    this._contentHtml = contentHtml;
    this._interactionHtml = interactionHtml;
    this._inputResponsePairs = inputResponsePairs;
    this._interaction = interaction;
    this._recordedVoiceovers = recordedVoiceovers;
    this._contentId = contentId;
    this._completed = false;
    this.audioTranslationLanguageService = audioTranslationLanguageService;
  }

  getStateName(): string {
    return this._stateName;
  }

  getInteraction(): Interaction {
    return this._interaction;
  }

  getVoiceovers(): IBindableVoiceovers {
    let recordedVoiceovers = this._recordedVoiceovers;
    let contentId = this._contentId;
    if (recordedVoiceovers) {
      return recordedVoiceovers.getBindableVoiceovers(contentId);
    }
    return {};
  }

  getRecordedVoiceovers(): RecordedVoiceovers {
    return this._recordedVoiceovers;
  }

  isContentAudioTranslationAvailable(): boolean {
    return Object.keys(
      this.getVoiceovers()).length > 0 ||
        this.audioTranslationLanguageService.isAutogeneratedAudioAllowed();
  }

  getInteractionId(): string | null {
    if (this.getInteraction()) {
      return this.getInteraction().id;
    }
    return null;
  }

  isTerminal(): boolean {
    let interactionId = this.getInteractionId();
    return (
      interactionId && INTERACTION_SPECS[interactionId].is_terminal);
  }

  getHints(): Hint[] {
    return this.getInteraction().hints;
  }

  getSolution(): Solution {
    return this.getInteraction().solution;
  }

  doesInteractionSupportHints(): boolean {
    let interactionId = this.getInteractionId();
    return (
      !INTERACTION_SPECS[interactionId].is_terminal &&
        !INTERACTION_SPECS[interactionId].is_linear);
  }

  isCompleted(): boolean {
    return this._completed;
  }

  markAsCompleted(): void {
    this._completed = true;
  }

  markAsNotCompleted(): void {
    this._completed = false;
  }

  getInteractionInstructions(): string {
    let interactionId = this.getInteractionId();
    return (
        interactionId ? INTERACTION_SPECS[interactionId].instructions : '');
  }

  getInteractionCustomizationArgs(): IInteractionCustomizationArgs {
    let interaction = this.getInteraction();
    if (!interaction) {
      return null;
    }
    return interaction.customizationArgs;
  }

  isInteractionInline(): boolean {
    let interactionId = this.getInteractionId();
    return (
      !interactionId ||
        INTERACTION_SPECS[interactionId].display_mode ===
        AppConstants.INTERACTION_DISPLAY_MODE_INLINE);
  }

  getContentHtml(): string {
    return this._contentHtml;
  }

  getInteractionHtml(): string {
    return this._interactionHtml;
  }

  getOppiaResponse(index: number): string {
    return this._inputResponsePairs[index].oppiaResponse;
  }

  getInputResponsePairs(): Array<IInputResponsePair> {
    return this._inputResponsePairs;
  }

  getLastInputResponsePair(): IInputResponsePair {
    if (this._inputResponsePairs.length === 0) {
      return null;
    }
    return this._inputResponsePairs[this._inputResponsePairs.length - 1];
  }

  getLastAnswer(): string {
    if (this.getLastInputResponsePair() === null) {
      return null;
    }
    return this.getLastInputResponsePair().learnerInput;
  }

  getLastOppiaResponse(): string {
    if (this.getLastInputResponsePair() === null) {
      return null;
    }
    return this.getLastInputResponsePair().oppiaResponse;
  }

  addInputResponsePair(inputResponsePair: IInputResponsePair): void {
    this._inputResponsePairs.push(cloneDeep(inputResponsePair));
  }

  setLastOppiaResponse(response: string): void {
    // This check is added here to ensure that this._inputReponsePairs is
    // accessed only if there is atleast one input response pair present.
    // In the editor preview tab if a user clicks on restart from beginning
    // option just after submitting an answer for a card while the response
    // is still loading, this function is called after
    // this._inputResponsePairs is set to null as we are starting from the
    // first card again. Adding a check here makes sure that element at index
    // -1 is not accessed even in the above case.
    if (this._inputResponsePairs.length >= 1) {
      this._inputResponsePairs[
        this._inputResponsePairs.length - 1].oppiaResponse = response;
    }
  }

  setInteractionHtml(interactionHtml: string): void {
    this._interactionHtml = interactionHtml;
  }
}

@Injectable({
  providedIn: 'root'
})
export class StateCardObjectFactory {
  constructor(private audioTranslationLanguageService:
                  AudioTranslationLanguageService ) {}

  /**
   * @param {string} stateName - The state name for the current card.
   * @param {string} contentHtml - The HTML string for the content displayed
   *        on the content card.
   * @param {string} interactionHtml - The HTML that calls the interaction
   *        directive for the current card.
   * @param {Interaction} interaction - An interaction object that stores all
   *        the properties of the card's interaction.
   * @param {RecordedVoiceovers} recordedVoiceovers
   * @param {string} contentId
   */
  createNewCard(
      stateName: string, contentHtml: string, interactionHtml: string,
      interaction: Interaction, recordedVoiceovers: RecordedVoiceovers,
      contentId: string): StateCard {
    return new StateCard(
      stateName, contentHtml, interactionHtml, interaction, [],
      recordedVoiceovers, contentId, this.audioTranslationLanguageService);
  }
}

angular.module('oppia').factory(
  'StateCardObjectFactory',
  downgradeInjectable(StateCardObjectFactory));
