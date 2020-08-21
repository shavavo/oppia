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
 * @fileoverview Directive containing the exploration material to be translated.
 */

import { Subscription } from 'rxjs';

import { SubtitledHtml } from 'domain/exploration/SubtitledHtmlObjectFactory';
import { SubtitledUnicode } from
  'domain/exploration/SubtitledUnicodeObjectFactory';
import { WRITTEN_TRANSLATION_TYPE_HTML, WRITTEN_TRANSLATION_TYPE_UNICODE } from
  'domain/exploration/WrittenTranslationObjectFactory';
import { InteractionCustomizationArgs } from
  'interactions/customization-args-defs';

require(
  'components/state-directives/response-header/response-header.directive.ts');
require(
  'pages/exploration-editor-page/translation-tab/audio-translation-bar/' +
  'audio-translation-bar.directive.ts');
require(
  'pages/exploration-editor-page/translation-tab/state-translation-editor/' +
  'state-translation-editor.component.ts'
);

require('domain/utilities/url-interpolation.service.ts');
require('filters/format-rte-preview.filter.ts');
require('filters/string-utility-filters/convert-to-plain-text.filter.ts');
require('filters/parameterize-rule-description.filter.ts');
require('filters/string-utility-filters/truncate.filter.ts');
require('filters/string-utility-filters/wrap-text-with-ellipsis.filter.ts');
require(
  'pages/exploration-editor-page/services/' +
  'exploration-correctness-feedback.service.ts');
require(
  'pages/exploration-editor-page/services/' +
  'exploration-init-state-name.service.ts');
require('pages/exploration-editor-page/services/exploration-states.service.ts');
require('pages/exploration-editor-page/services/router.service.ts');
require(
  'pages/exploration-editor-page/translation-tab/services/' +
  'translation-status.service.ts');
require(
  'pages/exploration-editor-page/translation-tab/services/' +
  'translation-tab-active-content-id.service.ts');
require(
  'components/state-editor/state-editor-properties-services/' +
  'state-editor.service.ts');

require(
  'pages/exploration-editor-page/exploration-editor-page.constants.ajs.ts');

const RULE_TEMPLATES = require('interactions/rule_templates.json');

angular.module('oppia').directive('stateTranslation', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {
        isTranslationTabBusy: '='
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/exploration-editor-page/translation-tab/' +
        'state-translation/state-translation.directive.html'),
      controller: [
        '$filter', '$rootScope', '$scope', 'CkEditorCopyContentService',
        'ExplorationCorrectnessFeedbackService',
        'ExplorationHtmlFormatterService',
        'ExplorationInitStateNameService', 'ExplorationLanguageCodeService',
        'ExplorationStatesService', 'RouterService', 'RuleObjectFactory',
        'StateEditorService',
        'TranslationLanguageService', 'TranslationStatusService',
        'TranslationTabActiveContentIdService',
        'TranslationTabActiveModeService', 'COMPONENT_NAME_CONTENT',
        'COMPONENT_NAME_FEEDBACK',
        'COMPONENT_NAME_INTERACTION_CUSTOMIZATION_ARGS',
        'COMPONENT_NAME_INTERACTION_RULE', 'COMPONENT_NAME_HINT',
        'COMPONENT_NAME_SOLUTION', 'INTERACTION_SPECS',
        'RULE_SUMMARY_WRAP_CHARACTER_COUNT',
        function(
            $filter, $rootScope, $scope, CkEditorCopyContentService,
            ExplorationCorrectnessFeedbackService,
            ExplorationHtmlFormatterService,
            ExplorationInitStateNameService, ExplorationLanguageCodeService,
            ExplorationStatesService, RouterService, RuleObjectFactory,
            StateEditorService,
            TranslationLanguageService, TranslationStatusService,
            TranslationTabActiveContentIdService,
            TranslationTabActiveModeService, COMPONENT_NAME_CONTENT,
            COMPONENT_NAME_FEEDBACK,
            COMPONENT_NAME_INTERACTION_CUSTOMIZATION_ARGS,
            COMPONENT_NAME_INTERACTION_RULE, COMPONENT_NAME_HINT,
            COMPONENT_NAME_SOLUTION, INTERACTION_SPECS,
            RULE_SUMMARY_WRAP_CHARACTER_COUNT
        ) {
          var ctrl = this;
          ctrl.directiveSubscriptions = new Subscription();
          $scope.isVoiceoverModeActive = (
            TranslationTabActiveModeService.isVoiceoverModeActive);
          var isTranslatedTextRequired = function() {
            return (TranslationTabActiveModeService.isVoiceoverModeActive() &&
              TranslationLanguageService.getActiveLanguageCode() !== (
                ExplorationLanguageCodeService.displayed));
          };
          $scope.getRequiredHtml = function(subtitledHtml) {
            var html = null;
            if (isTranslatedTextRequired()) {
              var contentId = subtitledHtml.getContentId();
              var activeLanguageCode = (
                TranslationLanguageService.getActiveLanguageCode());
              var writtenTranslations = (
                ExplorationStatesService.getWrittenTranslationsMemento(
                  $scope.stateName));
              if (writtenTranslations.hasWrittenTranslation(
                contentId, activeLanguageCode)) {
                var writtenTranslation = (
                  writtenTranslations.getWrittenTranslation(
                    contentId, activeLanguageCode));
                html = writtenTranslation.getHtml();
              }
            } else {
              html = subtitledHtml.getHtml();
            }
            return html;
          };

          $scope.getEmptyContentMessage = function() {
            if (TranslationTabActiveModeService.isVoiceoverModeActive()) {
              return (
                'The translation for this section has not been created yet. ' +
                'Switch to translation mode to add a text translation.');
            } else {
              return 'There is no text available to translate.';
            }
          };

          $scope.isActive = function(tabId) {
            return ($scope.activatedTabId === tabId);
          };

          $scope.navigateToState = function(stateName) {
            RouterService.navigateToMainTab(stateName);
          };

          $scope.onContentClick = function($event) {
            if (CkEditorCopyContentService.copyModeActive) {
              $event.stopPropagation();
            }
            CkEditorCopyContentService.broadcastCopy($event.target);
          };

          $scope.isCopyModeActive = function() {
            return CkEditorCopyContentService.copyModeActive;
          };

          $scope.onTabClick = function(tabId) {
            if ($scope.isTranslationTabBusy) {
              StateEditorService.onShowTranslationTabBusyModal.emit();
              return;
            }
            let activeContentId = null;
            let activeDataFormat = WRITTEN_TRANSLATION_TYPE_HTML;

            if (tabId === $scope.TAB_ID_CONTENT) {
              activeContentId = $scope.stateContent.getContentId();
            } else if (tabId === $scope.TAB_ID_FEEDBACK) {
              $scope.activeAnswerGroupIndex = 0;
              if ($scope.stateAnswerGroups.length > 0) {
                activeContentId = (
                  $scope.stateAnswerGroups[0].outcome.feedback.getContentId());
              } else {
                activeContentId = (
                  $scope.stateDefaultOutcome.feedback.getContentId());
              }
            } else if (tabId === $scope.TAB_ID_HINTS) {
              $scope.activeHintIndex = 0;
              activeContentId = (
                $scope.stateHints[0].hintContent.getContentId());
            } else if (tabId === $scope.TAB_ID_SOLUTION) {
              activeContentId = $scope.stateSolution.explanation.getContentId();
            } else if (tabId === $scope.TAB_ID_CUSTOMIZATION_ARGS) {
              $scope.activeCustomizationArgContentIndex = 0;
              const activeContent = (
                $scope.interactionCustomizationArgTranslatableContent[0].content
              );
              activeContentId = activeContent.getContentId();
              if (activeContent instanceof SubtitledUnicode) {
                activeDataFormat = WRITTEN_TRANSLATION_TYPE_UNICODE;
              }
            } else if (tabId === $scope.TAB_ID_RULES) {

            }

            TranslationTabActiveContentIdService.setActiveContent(
              activeContentId,
              activeDataFormat);
            $scope.activatedTabId = tabId;
          };

          $scope.summarizeDefaultOutcome = function(
              defaultOutcome, interactionId, answerGroupCount, shortenRule) {
            if (!defaultOutcome) {
              return '';
            }

            var summary = '';
            var hasFeedback = defaultOutcome.hasNonemptyFeedback();

            if (interactionId && INTERACTION_SPECS[interactionId].is_linear) {
              summary =
                INTERACTION_SPECS[interactionId].default_outcome_heading;
            } else if (answerGroupCount > 0) {
              summary = 'All other answers';
            } else {
              summary = 'All answers';
            }

            if (hasFeedback && shortenRule) {
              summary = $filter('wrapTextWithEllipsis')(
                summary, RULE_SUMMARY_WRAP_CHARACTER_COUNT);
            }
            summary = '[' + summary + '] ';

            if (hasFeedback) {
              summary +=
                $filter(
                  'convertToPlainText'
                )(defaultOutcome.feedback.getHtml());
            }
            return summary;
          };

          $scope.summarizeAnswerGroup = function(
              answerGroup, interactionId, answerChoices, shortenRule) {
            var summary = '';
            var outcome = answerGroup.outcome;
            var hasFeedback = outcome.hasNonemptyFeedback();

            if (answerGroup.getRulesAsList()) {
              var firstRule = $filter('convertToPlainText')(
                $filter('parameterizeRuleDescription')(
                  answerGroup.getRulesAsList()[0],
                  interactionId, answerChoices));
              summary = 'Answer ' + firstRule;

              if (hasFeedback && shortenRule) {
                summary = $filter('wrapTextWithEllipsis')(
                  summary, RULE_SUMMARY_WRAP_CHARACTER_COUNT);
              }
              summary = '[' + summary + '] ';
            }

            if (hasFeedback) {
              summary += (
                shortenRule ?
                  $filter('truncate')(outcome.feedback.getHtml(), 30) :
                  $filter('convertToPlainText')(outcome.feedback.getHtml()));
            }
            return summary;
          };

          $scope.summarizeRulesOfType = function(ruleType, ruleInputs) {
            let summary = '';
            ruleInputs.forEach((ruleInput, index) => {
              if (index !== 0) {
                const isLast = index === ruleInputs.length - 1;
                summary += isLast ? ' or ' : ', ';
              }
              summary += $filter('convertToPlainText')(
                $filter('parameterizeRuleDescription')(
                  RuleObjectFactory.createNew(ruleType, ruleInput),
                  $scope.stateInteractionId,
                  $scope.answerChoices));
            });
            return summary;
          };

          $scope.isDisabled = function(tabId) {
            if (tabId === $scope.TAB_ID_CONTENT) {
              return false;
            }
            // This is used to prevent users from adding unwanted audio for
            // default_outcome and hints in Continue and EndExploration
            // interaction. An exception is if the interaction contains
            // translatable customization arguments -- e.g. Continue
            // interaction's placeholder.
            if (
              tabId !== $scope.TAB_ID_CUSTOMIZATION_ARGS && (
                !$scope.stateInteractionId ||
                INTERACTION_SPECS[$scope.stateInteractionId].is_linear ||
                INTERACTION_SPECS[$scope.stateInteractionId].is_terminal
              )
            ) {
              return true;
            } else if (tabId === $scope.TAB_ID_FEEDBACK) {
              if (!$scope.stateDefaultOutcome) {
                return true;
              } else {
                return false;
              }
            } else if (tabId === $scope.TAB_ID_HINTS) {
              if ($scope.stateHints.length <= 0) {
                return true;
              } else {
                return false;
              }
            } else if (tabId === $scope.TAB_ID_SOLUTION) {
              if (!$scope.stateSolution) {
                return true;
              } else {
                return false;
              }
            } else if (tabId === $scope.TAB_ID_CUSTOMIZATION_ARGS) {
              return ($scope.interactionCustomizationArgTranslatableContent
                .length === 0);
            }
          };

          $scope.changeActiveHintIndex = function(newIndex) {
            if ($scope.isTranslationTabBusy) {
              StateEditorService.onShowTranslationTabBusyModal.emit();
              return;
            }
            if ($scope.activeHintIndex === newIndex) {
              return;
            }
            $scope.activeHintIndex = newIndex;
            var activeContentId = (
              $scope.stateHints[newIndex].hintContent.getContentId());
            TranslationTabActiveContentIdService.setActiveContent(
              activeContentId, WRITTEN_TRANSLATION_TYPE_HTML);
          };

          $scope.changeActiveCustomizationArgContentIndex = function(newIndex) {
            if ($scope.isTranslationTabBusy) {
              $rootScope.$broadcast('showTranslationTabBusyModal');
              return;
            }
            if ($scope.activeHintIndex === newIndex) {
              return;
            }
            const activeContent = (
              $scope.interactionCustomizationArgTranslatableContent[
                newIndex].content
            );
            const activeContentId = activeContent.getContentId();
            let activeDataFormat = null;
            if (activeContent instanceof SubtitledUnicode) {
              activeDataFormat = WRITTEN_TRANSLATION_TYPE_UNICODE;
            } else if (activeContent instanceof SubtitledHtml) {
              activeDataFormat = WRITTEN_TRANSLATION_TYPE_HTML;
            }
            TranslationTabActiveContentIdService.setActiveContent(
              activeContentId, activeDataFormat);
            $scope.activeCustomizationArgContentIndex = newIndex;
          };

          $scope.changeActiveAnswerGroupIndex = function(newIndex) {
            if ($scope.isTranslationTabBusy) {
              StateEditorService.onShowTranslationTabBusyModal.emit();
              return;
            }
            if ($scope.activeAnswerGroupIndex !== newIndex) {
              var activeContentId = null;
              $scope.activeAnswerGroupIndex = newIndex;
              if (newIndex === $scope.stateAnswerGroups.length) {
                activeContentId = (
                  $scope.stateDefaultOutcome.feedback.getContentId());
              } else {
                activeContentId = ($scope.stateAnswerGroups[newIndex]
                  .outcome.feedback.getContentId());
              }
              TranslationTabActiveContentIdService.setActiveContent(
                activeContentId, WRITTEN_TRANSLATION_TYPE_HTML);
            }
          };

          $scope.tabStatusColorStyle = function(tabId) {
            if (!$scope.isDisabled(tabId)) {
              var color = TranslationStatusService
                .getActiveStateComponentStatusColor(tabId);
              return {'border-top-color': color};
            }
          };

          $scope.tabNeedUpdatesStatus = function(tabId) {
            if (!$scope.isDisabled(tabId)) {
              return TranslationStatusService
                .getActiveStateComponentNeedsUpdateStatus(tabId);
            }
          };
          $scope.contentIdNeedUpdates = function(contentId) {
            return TranslationStatusService
              .getActiveStateContentIdNeedsUpdateStatus(contentId);
          };
          $scope.contentIdStatusColorStyle = function(contentId) {
            var color = TranslationStatusService
              .getActiveStateContentIdStatusColor(contentId);
            return {'border-left': '3px solid ' + color};
          };

          $scope.getSubtitledContentSummary = function(subtitledContent) {
            if (subtitledContent instanceof SubtitledHtml) {
              return $filter('formatRtePreview')(subtitledContent.getHtml());
            } else if (subtitledContent instanceof SubtitledUnicode) {
              return subtitledContent.getUnicode();
            }
          };

          $scope.getInteractionCustomizationArgTranslatableContents = function(
              customizationArgs: InteractionCustomizationArgs
          ): {name: string, content: SubtitledUnicode|SubtitledHtml}[] {
            const translatableContents = [];

            const camelCaseToSentenceCase = (s) => {
              // Lowercase the first letter (edge case for UpperCamelCase).
              s = s.charAt(0).toLowerCase() + s.slice(1);
              // Add a space in front of capital letters.
              s = s.replace(/([A-Z])/g, ' $1');
              // Captialize first letter.
              s = s.charAt(0).toUpperCase() + s.slice(1);
              return s;
            };

            const traverseValueAndRetrieveSubtitledContent = (
                name: string,
                value: Object[] | Object,
            ): void => {
              if (value instanceof SubtitledUnicode ||
                  value instanceof SubtitledHtml
              ) {
                translatableContents.push({
                  name, content: value
                });
              } else if (value instanceof Array) {
                value.forEach((element, index) =>
                  traverseValueAndRetrieveSubtitledContent(
                    `${name} (${index})`,
                    element)
                );
              } else if (value instanceof Object) {
                Object.keys(value).forEach(key =>
                  traverseValueAndRetrieveSubtitledContent(
                    `${name} > ${camelCaseToSentenceCase(key)}`,
                    value[key]
                  )
                );
              }
            };

            Object.keys(customizationArgs).forEach(caName =>
              traverseValueAndRetrieveSubtitledContent(
                camelCaseToSentenceCase(caName),
                customizationArgs[caName].value));

            return translatableContents;
          };

          /**
           * Get all translatable rule inputs from all AnswerGroups.
           * @returns {Object} - A object containing the answer group index,
           *  rule type, rule inputs, and content id.
           */
          $scope.getInteractionTranslatableRuleInputs = function() {
            const translatableRuleInputs = [];
            $scope.stateAnswerGroups.forEach((answerGroup, i) => {
              Object.keys(answerGroup.ruleTypesToInputs).forEach(ruleType => {
                const contentId = (
                  answerGroup.ruleTypesToInputs[ruleType].contentId);
                if (contentId === null) {
                  return;
                }

                translatableRuleInputs.push({
                  answerGroupIndex: i,
                  ruleInputs:
                    answerGroup.ruleTypesToInputs[ruleType].ruleInputs,
                  ruleType,
                  contentId
                });
              });
            });
            return translatableRuleInputs;
          };

          $scope.initStateTranslation = function() {
            $scope.stateName = StateEditorService.getActiveStateName();
            $scope.stateContent = ExplorationStatesService
              .getStateContentMemento($scope.stateName);
            $scope.stateSolution = ExplorationStatesService
              .getSolutionMemento($scope.stateName);
            $scope.stateHints = ExplorationStatesService
              .getHintsMemento($scope.stateName);
            $scope.stateAnswerGroups = ExplorationStatesService
              .getInteractionAnswerGroupsMemento($scope.stateName);
            $scope.stateDefaultOutcome = ExplorationStatesService
              .getInteractionDefaultOutcomeMemento($scope.stateName);
            $scope.stateInteractionId = ExplorationStatesService
              .getInteractionIdMemento($scope.stateName);
            $scope.stateInteractionCustomizationArgs = ExplorationStatesService
              .getInteractionCustomizationArgsMemento($scope.stateName);
            $scope.activeHintIndex = null;
            $scope.activeAnswerGroupIndex = null;
            $scope.activeRuleType = null;

            var currentCustomizationArgs = ExplorationStatesService
              .getInteractionCustomizationArgsMemento($scope.stateName);
            $scope.answerChoices = StateEditorService.getAnswerChoices(
              $scope.stateInteractionId, currentCustomizationArgs);
            $scope.interactionPreviewHtml = (
              ExplorationHtmlFormatterService.getInteractionHtml(
                $scope.stateInteractionId,
                $scope.stateInteractionCustomizationArgs, false)
            );
            $scope.interactionCustomizationArgTranslatableContent = (
              $scope.getInteractionCustomizationArgTranslatableContents(
                $scope.stateInteractionCustomizationArgs)
            );
            $scope.interactionTranslatableRuleInputs = (
              $scope.getInteractionTranslatableRuleInputs());
            console.log($scope.interactionTranslatableRuleInputs)

            if (TranslationTabActiveModeService.isVoiceoverModeActive()) {
              $scope.needsUpdateTooltipMessage = 'Audio needs update to ' +
                'match text. Please record new audio.';
            } else {
              $scope.needsUpdateTooltipMessage = 'Translation needs update ' +
                'to match text. Please re-translate the content.';
            }
            $scope.onTabClick($scope.TAB_ID_CONTENT);
          };
          ctrl.$onInit = function() {
            // Define tab constants.
            $scope.TAB_ID_CONTENT = COMPONENT_NAME_CONTENT;
            $scope.TAB_ID_FEEDBACK = COMPONENT_NAME_FEEDBACK;
            $scope.TAB_ID_HINTS = COMPONENT_NAME_HINT;
            $scope.TAB_ID_SOLUTION = COMPONENT_NAME_SOLUTION;
            $scope.TAB_ID_RULES = COMPONENT_NAME_INTERACTION_RULE;
            $scope.TAB_ID_CUSTOMIZATION_ARGS = (
              COMPONENT_NAME_INTERACTION_CUSTOMIZATION_ARGS);

            $scope.INTERACTION_SPECS = INTERACTION_SPECS;
            $scope.ExplorationCorrectnessFeedbackService =
              ExplorationCorrectnessFeedbackService;

            // Activates Content tab by default.
            $scope.activatedTabId = $scope.TAB_ID_CONTENT;

            $scope.activeHintIndex = null;
            $scope.activeAnswerGroupIndex = null;
            $scope.activeCustomizationArgContentIndex = null;
            $scope.stateContent = null;
            $scope.stateInteractionId = null;
            $scope.stateAnswerGroups = [];
            $scope.stateDefaultOutcome = null;
            $scope.stateHints = [];
            $scope.stateSolution = null;
            ctrl.directiveSubscriptions.add(
              StateEditorService.onRefreshStateTranslation.subscribe(
                () => $scope.initStateTranslation())
            );
            $scope.initStateTranslation();
          };

          ctrl.$onDestroy = function() {
            ctrl.directiveSubscriptions.unsubscribe();
          };
        }
      ]
    };
  }]);
