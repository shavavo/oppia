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
 * @fileoverview Unit tests for the SubtitledUnicode object factory.
 */

import { SubtitledUnicodeObjectFactory, SubtitledUnicode } from
  'domain/exploration/SubtitledUnicodeObjectFactory';

describe('SubtitledUnicode object factory', () => {
  let suof: SubtitledUnicodeObjectFactory, subtitledUnicode: SubtitledUnicode;

  beforeEach(() => {
    suof = new SubtitledUnicodeObjectFactory();

    subtitledUnicode = suof.createFromBackendDict({
      content_id: 'content_id',
      unicode_str: 'some string'
    });
  });

  it('should get and set unicode correctly', () => {
    expect(subtitledUnicode.getUnicode()).toEqual('some string');
    subtitledUnicode.setUnicode('new string');
    expect(subtitledUnicode.getUnicode()).toEqual('new string');
  });

  it('should get and set contentId correctly', () => {
    expect(subtitledUnicode.getContentId()).toEqual('content_id');
    subtitledUnicode.setContentId('new_content_id');
    expect(subtitledUnicode.getContentId()).toEqual('new_content_id');
  });

  it('should correctly check existence of unicode', () => {
    expect(subtitledUnicode.hasNoUnicode()).toBe(false);
    subtitledUnicode.setUnicode('');
    expect(subtitledUnicode.hasNoUnicode()).toBe(true);
  });

  it('should correctly check emptiness', () => {
    expect(subtitledUnicode.isEmpty()).toBe(false);

    subtitledUnicode.setUnicode('');
    expect(subtitledUnicode.isEmpty()).toBe(true);

    subtitledUnicode.setUnicode('hello');
    expect(subtitledUnicode.isEmpty()).toBe(false);
  });

  it('should convert to backend dict correctly', () => {
    expect(subtitledUnicode.toBackendDict()).toEqual({
      content_id: 'content_id',
      unicode_str: 'some string'
    });
  });

  it('should create default object', () => {
    var defaultSubtitledUnicode = suof
      .createDefault('test string', 'content_id');
    expect(defaultSubtitledUnicode.getUnicode()).toEqual('test string');
    expect(defaultSubtitledUnicode.getContentId()).toEqual('content_id');
  });
});
