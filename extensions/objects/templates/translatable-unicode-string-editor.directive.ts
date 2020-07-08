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
 * @fileoverview Directive for translatable HTML editor.
 */

angular.module('oppia').directive('SubtitledUnicodeEditor', [
  function() {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {
        value: '=',
        getInitArgs: '&'
      },
      template: require('./translatable-unicode-string-editor.directive.html'),
      controllerAs: '$ctrl',
      controller: [function() {
        var ctrl = this;
        ctrl.$onInit = function() {
          ctrl.initArgs = ctrl.getInitArgs();
          ctrl.schema = { type: 'unicode' };

          if (ctrl.initArgs &&
            ctrl.initArgs.schema &&
            ctrl.initArgs.schema.ui_config
          ) {
            ctrl.schema.ui_config = ctrl.initArgs.schema.ui_config;
          }
        };
      }]
    };
  }]);