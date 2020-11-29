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
 * @fileoverview Unit tests for the list of unicode string editor.
 */

// TODO(#11014): Add more extensive front end tests for object editors that rely
// on schema editors.
describe('SubtitledSetOfUnicodeStringEditor', function() {
  var ctrl = null;

  beforeEach(angular.mock.module('oppia'));
  beforeEach(angular.mock.inject(function($componentController) {
    ctrl = $componentController('subtitledSetOfUnicodeStringEditor');
  }));

  it('should initialize the schema', function() {
    ctrl.$onInit();
    expect(ctrl.SCHEMA).toEqual({
      type: 'list',
      items: {
        type: 'unicode'
      },
      validators: [{
        id: 'is_uniquified'
      }]
    });
  });
});
