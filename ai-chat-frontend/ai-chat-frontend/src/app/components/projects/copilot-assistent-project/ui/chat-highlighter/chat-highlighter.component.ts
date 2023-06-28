import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { formatRelativeTime } from 'src/app/services/date-utils';
import { Message, Origin } from 'src/app/shared/models/conversation.model';

@Component({
  selector: 'chat-highlighter',
  templateUrl: './chat-highlighter.component.html',
  styleUrls: ['./chat-highlighter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatHighlighterComponent implements OnChanges {
  @Input() message: Message;
  public processedBlocks: { text: string, origin: Origin, isCode: boolean}[] = [];
  public commentList: any;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['message'] && changes['message'].currentValue !== changes['message'].previousValue) {
      this.processCodeInput(changes['message'].currentValue);
    }

    if (changes['message'] && changes['message'].currentValue) {
      const message = changes['message'].currentValue as Message;
      const timeAgo = formatRelativeTime(message.timestamp);

      this.commentList = [
        {
          shortName: message.origin === Origin.AI_ASSISTANT ? 'AI' : message.owner.shortName,
          shortNameBgColor: message.origin === Origin.AI_ASSISTANT ? '#415385' : '#D04A02',
          shortNameFontColor: '#ffffff',
          fullName: message.owner.firstName + " " + message.owner.lastName,
          commentsTime: timeAgo,
          commentsContent: "" // Populate this as needed
        },
      ];
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }


  processCodeInput(message: Message) {
    const segments = message.content.split(/(```)/);
    let isCode = false;
    this.processedBlocks = [];
    let justExitedCodeBlock = false;

    for (const segment of segments) {
      // Ignore empty segments
      if (!segment) continue;

      // When a '```' is encountered, flip the isCode flag
      if (segment === '```') {
        isCode = !isCode;
        justExitedCodeBlock = !isCode; // This is true if we just closed a code block
        continue;
      }

      // Replace newline characters with <br> tags only for non-code text
      let formattedText = segment;
      if (!isCode) {
        // If this is the segment immediately following a code block, trim the start of it
        if (justExitedCodeBlock) {
          formattedText = formattedText.replace(/^\n+/g, ''); // This removes leading newline characters
          justExitedCodeBlock = false;
        }
        formattedText = formattedText.replace(/\n/g, '<br>');
        formattedText = formattedText.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        formattedText = formattedText.replace(/`(.+?)`/g, '<b>$1</b>');
      } else {
        // Remove leading and trailing whitespace from code blocks
        formattedText = formattedText.trim();
      }

      // Add current segment as a block (either code or non-code)
      this.processedBlocks.push({ text: formattedText, isCode, origin: message.origin });
    }
  }


  // Assume you have a callback function when your app theme is changed
  // onAppThemeChange(appTheme: 'dark' | 'light') {
  //   this.hljsLoader.setTheme(appTheme === 'dark' ? 'assets/styles/solarized-dark.css' : 'assets/styles/solarized-light.css');
  // }

}
