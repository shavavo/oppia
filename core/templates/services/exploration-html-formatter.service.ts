// Copyright 2014 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Utility services for explorations which may be shared by both
 * the learner and editor views.
 */
import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';

import { CamelCaseToHyphensPipe } from
  'filters/string-utility-filters/camel-case-to-hyphens.pipe';
import { ExtensionTagAssemblerService } from
  'services/extension-tag-assembler.service';
import { HtmlEscaperService } from 'services/html-escaper.service';
import { IInteractionAnswer } from 'interactions/answer-defs';
import { IInteractionCustomizationArgs } from
  'interactions/customization-args-defs';
import { SubtitledHtml } from
  'domain/exploration/SubtitledHtmlObjectFactory';
import { SubtitledUnicode } from
  'domain/exploration/SubtitledUnicodeObjectFactory';


// A service that provides a number of utility functions useful to both the
// editor and player.
@Injectable({
  providedIn: 'root'
})
export class ExplorationHtmlFormatterService {
  constructor(
      private camelCaseToHyphens: CamelCaseToHyphensPipe,
      private extensionTagAssembler: ExtensionTagAssemblerService,
      private htmlEscaper: HtmlEscaperService
  ) {}

  unwrapInteractionCustArgsContent(caValues: IInteractionCustomizationArgs) {
    if (!caValues) {
      return {};
    }

    const unwrapContent = (
        value: Array<Object> | Object
    ) => {
      if (value instanceof SubtitledUnicode) {
        value = value.getUnicode();
      } else if (value instanceof SubtitledHtml) {
        value = value.getHtml();
      } else if (value instanceof Array) {
        for (let i = 0; i < value.length; i++) {
          value[i] = unwrapContent(value[i]);
        }
      } else if (value instanceof Object) {
        Object.keys(value).forEach(key => {
          value[key] = unwrapContent(value[key]);
        });
      }

      return value;
    };

    let unwrappedCaValues = {};
    Object.keys(caValues).forEach(key => {
      unwrappedCaValues[key] = (
        unwrapContent(caValues[key]));
    });
    return unwrappedCaValues;
  }

  /**
   * @param {string} interactionId - The interaction id.
   * @param {object} interactionCustomizationArgSpecs - The various
   *   attributes that the interaction depends on.
   * @param {boolean} parentHasLastAnswerProperty - If this function is
   *   called in the exploration_player view (including the preview mode),
   *   callers should ensure that parentHasLastAnswerProperty is set to
   *   true and $scope.lastAnswer =
   *   PlayerTranscriptService.getLastAnswerOnDisplayedCard(index) is set on
   *   the parent controller of the returned tag.
   *   Otherwise, parentHasLastAnswerProperty should be set to false.
   * @param {string} labelForFocusTarget - The label for setting focus on
   *   the interaction.
   */
  getInteractionHtml(
      interactionId: string,
      interactionCustomizationArgs: IInteractionCustomizationArgs,
      parentHasLastAnswerProperty: boolean,
      labelForFocusTarget: string): string {
    var htmlInteractionId = this.camelCaseToHyphens.transform(interactionId);
    var element = $('<oppia-interactive-' + htmlInteractionId + '>');

    const ca = angular.copy(interactionCustomizationArgs);
    this.unwrapInteractionCustArgsContent(ca);

    element = (
      this.extensionTagAssembler.formatCustomizationArgAttrs(element, ca));
    element.attr('last-answer', parentHasLastAnswerProperty ?
      'lastAnswer' : 'null');
    if (labelForFocusTarget) {
      element.attr('label-for-focus-target', labelForFocusTarget);
    }
    return element.get(0).outerHTML;
  }

  getAnswerHtml(
      answer: string, interactionId: string,
      interactionCustomizationArgs: IInteractionCustomizationArgs): string {
    // TODO(sll): Get rid of this special case for multiple choice.
    var interactionChoices = null;

    interactionCustomizationArgs = angular.copy(interactionCustomizationArgs);
    this.unwrapInteractionCustArgsContent(interactionCustomizationArgs);

    if ('choices' in interactionCustomizationArgs) {
      interactionChoices = interactionCustomizationArgs.choices.value;
    }

    var el = $(
      '<oppia-response-' + this.camelCaseToHyphens.transform(
        interactionId) + '>');
    el.attr('answer', this.htmlEscaper.objToEscapedJson(answer));
    if (interactionChoices) {
      el.attr('choices', this.htmlEscaper.objToEscapedJson(
        interactionChoices));
    }
    return ($('<div>').append(el)).html();
  }

  getShortAnswerHtml(
      answer: IInteractionAnswer, interactionId: string,
      interactionCustomizationArgs: IInteractionCustomizationArgs) : string {
    var interactionChoices = null;

    interactionCustomizationArgs = angular.copy(interactionCustomizationArgs);
    this.unwrapInteractionCustArgsContent(interactionCustomizationArgs);

    // TODO(sll): Get rid of this special case for multiple choice.
    if ('choices' in interactionCustomizationArgs) {
      interactionChoices = interactionCustomizationArgs.choices.value;
    }

    var el = $(
      '<oppia-short-response-' + this.camelCaseToHyphens.transform(
        interactionId) + '>');
    el.attr('answer', this.htmlEscaper.objToEscapedJson(answer));
    if (interactionChoices) {
      el.attr('choices', this.htmlEscaper.objToEscapedJson(
        interactionChoices));
    }
    return ($('<span>').append(el)).html();
  }
}

angular.module('oppia').factory(
  'ExplorationHtmlFormatterService',
  downgradeInjectable(ExplorationHtmlFormatterService));
