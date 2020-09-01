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
 * @fileoverview Unit tests for ratio expression input validation service.
 */

import { TestBed } from '@angular/core/testing';

import { AnswerGroup, AnswerGroupObjectFactory } from
  'domain/exploration/AnswerGroupObjectFactory';
import { RatioExpressionInputValidationService } from
// eslint-disable-next-line max-len
  'interactions/RatioExpressionInput/directives/ratio-expression-input-validation.service';
import { Outcome, OutcomeObjectFactory } from
  'domain/exploration/OutcomeObjectFactory';
import { Rule, RuleObjectFactory } from
  'domain/exploration/RuleObjectFactory';
import { SubtitledUnicode } from
  'domain/exploration/SubtitledUnicodeObjectFactory';
import { RatioExpressionInputCustomizationArgs } from
  'extensions/interactions/customization-args-defs';

import { AppConstants } from 'app.constants';
import { WARNING_TYPES_CONSTANT } from 'app-type.constants';

describe('RatioExpressionInputValidationService', () => {
  let validatorService: RatioExpressionInputValidationService;
  let WARNING_TYPES: WARNING_TYPES_CONSTANT;

  let currentState: string;
  let answerGroups: AnswerGroup[], goodDefaultOutcome: Outcome;
  let equals: Rule, isEquivalent: Rule, hasNumberOfTermsEqualTo: Rule;
  let customizationArgs: RatioExpressionInputCustomizationArgs;
  let oof: OutcomeObjectFactory, agof: AnswerGroupObjectFactory,
    rof: RuleObjectFactory;
  let warnings;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RatioExpressionInputValidationService]
    });

    validatorService = TestBed.get(RatioExpressionInputValidationService);
    oof = TestBed.get(OutcomeObjectFactory);
    agof = TestBed.get(AnswerGroupObjectFactory);
    rof = TestBed.get(RuleObjectFactory);
    WARNING_TYPES = AppConstants.WARNING_TYPES;

    currentState = 'First State';
    goodDefaultOutcome = oof.createFromBackendDict({
      dest: 'Second State',
      feedback: {
        html: '',
        content_id: ''
      },
      labelled_as_correct: false,
      param_changes: [],
      refresher_exploration_id: null,
      missing_prerequisite_skill_id: null
    });

    customizationArgs = {
      placeholder: {
        value: new SubtitledUnicode('', '')
      },
      numberOfTerms: {
        value: 3
      }
    };

    isEquivalent = rof.createFromBackendDict({
      rule_type: 'IsEquivalent',
      inputs: {
        x: [1, 2, 3]
      }
    });

    equals = rof.createFromBackendDict({
      rule_type: 'Equals',
      inputs: {
        x: [1, 2, 3]
      }
    });

    hasNumberOfTermsEqualTo = rof.createFromBackendDict({
      rule_type: 'HasNumberOfTermsEqualTo',
      inputs: {
        y: 3
      }
    });

    answerGroups = [agof.createNew([], goodDefaultOutcome, null, null)];
  });

  it('should be able to perform basic validation', () => {
    warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([]);
  });

  it('should catch redundancy of rules with matching inputs', () => {
    // The third rule will never get matched.
    answerGroups[0].rules = [equals, isEquivalent];

    warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 2 from answer group 1 will never be matched because' +
      ' it is preceded by a \'Equals\' rule with a matching' +
      ' input.'
    }]);
    let isEquivalentNonSimplified = rof.createFromBackendDict({
      rule_type: 'IsEquivalent',
      inputs: {
        x: [2, 4, 6]
      }
    });

    // The second rule will never get matched.
    answerGroups[0].rules = [isEquivalent, isEquivalentNonSimplified];

    warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 2 from answer group 1 will never be matched because' +
      ' provided input is not in its simplest form.'
    }, {
      type: WARNING_TYPES.ERROR,
      message: 'Rule 2 from answer group 1 will never be matched because' +
      ' it is preceded by a \'IsEquivalent\' rule with a matching' +
      ' input.'
    }
    ]);

    let equalFourTerms = rof.createFromBackendDict({
      rule_type: 'Equals',
      inputs: {
        x: [1, 2, 3, 4]
      }
    });

    // The second rule will never get matched.
    answerGroups[0].rules = [hasNumberOfTermsEqualTo, equals, equalFourTerms];

    warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 2 from answer group 1 will never be matched because' +
      ' it is preceded by a \'HasNumberOfTermsEqualTo\' rule with a matching' +
      ' input.'
    }]);

    let equalsTwoTerms = rof.createFromBackendDict({
      rule_type: 'Equals',
      inputs: {
        x: [1, 2]
      }
    });
    let hasNumberOfTermsEqualToLength2 = rof.createFromBackendDict({
      rule_type: 'HasNumberOfTermsEqualTo',
      inputs: {
        y: 2
      }
    });

    // The second rule will never get matched.
    answerGroups[0].rules = [
      equalsTwoTerms, equals, hasNumberOfTermsEqualToLength2];
    warnings = validatorService.getAllWarnings(currentState,
      customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 1 from answer group 1 will never be matched because' +
      ' it has fewer number of terms than required.'
    }, {
      type: WARNING_TYPES.ERROR,
      message: 'Rule 3 from answer group 1 will never be matched because' +
      ' it has fewer number of terms than required.'
    }]);
  });

  it('should catch non-integer value for # terms', () => {
    customizationArgs.numberOfTerms.value = 1.5;
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: ('The number of terms should be a positive integer.')
    }]);
  });

  it('should catch undefined value for # terms', () => {
    customizationArgs.numberOfTerms.value = undefined;
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: ('The number of terms should be a positive integer.')
    }]);
  });

  it('should catch negative value for # terms', () => {
    customizationArgs.numberOfTerms.value = -1;
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: ('The number of terms should be a positive integer.')
    }]);
  });

  it('should catch integral value 1 for # terms', () => {
    customizationArgs.numberOfTerms.value = 1;
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: ('The number of terms in a ratio should be greater than 1.')
    }]);
  });
});
