This document serves as a daily diary of my progress on TrackIt. The idea is to write down what I did at the end of each day/session, and ideas for the next steps. Then, next time I pick things up the context will be preserved; I can just read this, remember where I left off and get back to building.

## Jan 23rd, 2025 - 1 hr of building
Today, I implemented the functionality of editing time entry's start time (in a calendar pop-up, via input field). It works only locally, on blur of the input field - the new value gets validated (to make sure its a valid time input, e.g. 10:32 PM, and not sth random), and then the time entry's duration also gets updated (outside of a pop, in a row of the list).

I also took care of the case when user sets the start time to be after the end time - in that case, we bump the end time for +1 day, so things still make sense.

**Next steps:**
- do the same for the end time. Then see what we can extract from these two functions, as they should be fairly similar. Also take care of the "end time is before start time" case - see how Toggl handles it.
- Get rid of the "Save" button in a pop-up, and save everything to the db when the pop-up gets closed (there is an event handler from Headless-UI's Popover component I can use)